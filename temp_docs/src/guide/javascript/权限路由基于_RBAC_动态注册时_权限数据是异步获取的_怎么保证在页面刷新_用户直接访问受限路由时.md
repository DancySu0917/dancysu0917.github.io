# 权限路由基于 RBAC 动态注册时，权限数据是异步获取的，怎么保证在页面刷新、用户直接访问受限路由时不出错？（了解）

**题目**: 权限路由基于 RBAC 动态注册时，权限数据是异步获取的，怎么保证在页面刷新、用户直接访问受限路由时不出错？（了解）

**答案**:

这是一个常见的权限管理问题，主要涉及路由守卫、异步数据获取和用户体验的平衡。以下是几种解决方案：

## 1. 路由守卫 + 路由拦截

### Vue Router 实现：
```javascript
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// 初始路由，包含登录页等公共路由
const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  // 其他公共路由
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 异步添加权限路由的函数
function addPermissionRoutes() {
  const permissionRoutes = store.getters['permissionRoutes']
  permissionRoutes.forEach(route => {
    router.addRoute(route)
  })
}

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  } else {
    // 检查是否已获取用户信息和权限
    const hasUserInfo = store.getters.hasUserInfo
    
    if (!hasUserInfo) {
      try {
        // 获取用户信息和权限
        await store.dispatch('user/getUserInfo')
        await store.dispatch('permission/generateRoutes')
        
        // 动态添加权限路由
        addPermissionRoutes()
        
        // 确保路由已添加后再跳转
        next({ ...to, replace: true })
      } catch (error) {
        // 获取失败，清除 token 并跳转到登录页
        store.dispatch('user/resetToken')
        next('/login')
      }
    } else {
      // 已有用户信息，检查是否有访问权限
      if (to.matched.length === 0) {
        // 路由不存在，可能是权限路由还未添加
        next('/404')
      } else {
        next()
      }
    }
  }
})
```

### React Router 实现：
```jsx
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { fetchUserPermissions } from '@/store/authSlice'

// 路由守卫组件
function RouteGuard({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const { isAuthenticated, permissions, status } = useAppSelector(state => state.auth)
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // 未认证，跳转到登录页
        navigate('/login', { replace: true })
        return
      }
      
      if (status === 'idle') {
        // 权限数据未加载，开始加载
        try {
          await dispatch(fetchUserPermissions()).unwrap()
        } catch (error) {
          // 权限获取失败，跳转到登录页
          navigate('/login', { replace: true })
        }
      }
    }
    
    checkAuth()
  }, [isAuthenticated, status, dispatch, navigate])
  
  // 显示加载状态
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  
  // 检查当前路由权限
  const currentRoute = location.pathname
  const hasPermission = checkRoutePermission(currentRoute, permissions)
  
  if (!hasPermission) {
    return <div>403 - Access Denied</div>
  }
  
  return children
}

// 使用路由守卫
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*" 
        element={
          <RouteGuard>
            <ProtectedRoutes />
          </RouteGuard>
        } 
      />
    </Routes>
  )
}
```

## 2. 应用启动时预加载权限数据

```javascript
// main.js 或 app.js 中预加载权限数据
async function initApp() {
  const token = localStorage.getItem('token')
  
  if (token) {
    try {
      // 在应用启动时就获取用户权限
      await store.dispatch('user/getUserInfo')
      await store.dispatch('permission/generateRoutes')
      
      // 动态注册权限路由
      const permissionRoutes = store.getters.permissionRoutes
      permissionRoutes.forEach(route => {
        router.addRoute(route)
      })
    } catch (error) {
      // 获取权限失败，清除 token
      store.dispatch('user/resetToken')
      router.push('/login')
    }
  }
  
  // 启动应用
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

initApp()
```

## 3. 使用 Suspense 或 Loading 状态

```jsx
// 使用 React Suspense
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { permissions, isPermissionsLoaded } = useAuth()
  
  if (!isPermissionsLoaded) {
    return <div>Loading permissions...</div>
  }
  
  if (!hasPermission(permissions, requiredPermission)) {
    return <div>403 - Access Denied</div>
  }
  
  return children
}

// 或使用 Suspense 组件
const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute requiredPermission="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  )
}
```

## 4. 路由懒加载 + 权限检查

```javascript
// 路由配置
const routes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    beforeEnter: (to, from, next) => {
      // 在进入路由前检查权限
      if (checkPermission('admin')) {
        next()
      } else {
        next('/403') // 无权限页面
      }
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { permission: 'admin:dashboard' }
      }
    ]
  }
]

// 权限检查函数
function checkPermission(permission) {
  const userPermissions = store.getters.userPermissions
  return userPermissions.includes(permission)
}
```

## 5. 服务端渲染 (SSR) 解决方案

```javascript
// 在服务端获取权限数据
export async function getServerSideProps(context) {
  const token = context.req.cookies.token
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  
  try {
    // 获取用户权限
    const permissions = await fetchUserPermissions(token)
    
    // 检查当前路由权限
    if (!hasRoutePermission(context.resolvedUrl, permissions)) {
      return {
        redirect: {
          destination: '/403',
          permanent: false,
        },
      }
    }
    
    return {
      props: {
        permissions,
        // 其他 props
      },
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
}
```

## 6. 缓存策略

```javascript
// 缓存用户权限数据，减少重复请求
class PermissionCache {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 1000 * 60 * 30 // 30分钟过期
  }
  
  set(userId, permissions) {
    this.cache.set(userId, {
      permissions,
      timestamp: Date.now()
    })
  }
  
  get(userId) {
    const cached = this.cache.get(userId)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(userId)
      return null
    }
    
    return cached.permissions
  }
  
  clear() {
    this.cache.clear()
  }
}

const permissionCache = new PermissionCache()
```

## 最佳实践总结：

1. **优先使用路由守卫**：在路由级别进行权限控制
2. **预加载权限数据**：在应用初始化时获取权限信息
3. **提供加载状态**：给用户良好的等待体验
4. **错误处理**：妥善处理权限获取失败的情况
5. **缓存策略**：避免重复请求权限数据
6. **安全原则**：客户端权限控制只是用户体验优化，关键权限验证应在服务端进行

通过这些方案的组合使用，可以有效解决页面刷新和直接访问受限路由时的问题。
