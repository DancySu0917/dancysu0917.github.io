# 如何减少项目里面 if-else？（了解）

**题目**: 如何减少项目里面 if-else？（了解）

**答案**:

在项目开发中，过多的 if-else 语句会导致代码结构复杂、难以维护。以下是几种减少 if-else 的常用方法：

## 1. 使用策略模式（Strategy Pattern）

将不同的条件处理逻辑封装成独立的策略类：

```javascript
// 重构前：大量的 if-else
function calculateDiscount(userType, amount) {
  if (userType === 'VIP') {
    return amount * 0.8;
  } else if (userType === 'GOLD') {
    return amount * 0.85;
  } else if (userType === 'SILVER') {
    return amount * 0.9;
  } else {
    return amount;
  }
}

// 重构后：策略模式
const discountStrategies = {
  VIP: (amount) => amount * 0.8,
  GOLD: (amount) => amount * 0.85,
  SILVER: (amount) => amount * 0.9,
  DEFAULT: (amount) => amount
};

function calculateDiscount(userType, amount) {
  const strategy = discountStrategies[userType] || discountStrategies.DEFAULT;
  return strategy(amount);
}
```

## 2. 使用 Map/对象映射

将条件判断转换为对象属性访问：

```javascript
// 重构前：if-else 链
function getShippingCost(country) {
  if (country === 'US') {
    return 10;
  } else if (country === 'CA') {
    return 15;
  } else if (country === 'UK') {
    return 20;
  } else {
    return 25;
  }
}

// 重构后：对象映射
const shippingCosts = {
  US: 10,
  CA: 15,
  UK: 20
};

function getShippingCost(country) {
  return shippingCosts[country] || 25; // 默认值
}
```

## 3. 使用多态（Polymorphism）

通过继承和多态来处理不同的行为：

```javascript
// 重构前：大量 if-else
class PaymentProcessor {
  process(type, amount) {
    if (type === 'CREDIT_CARD') {
      // 信用卡支付逻辑
      console.log(`Processing credit card payment of ${amount}`);
    } else if (type === 'PAYPAL') {
      // PayPal 支付逻辑
      console.log(`Processing PayPal payment of ${amount}`);
    } else if (type === 'BANK_TRANSFER') {
      // 银行转账逻辑
      console.log(`Processing bank transfer of ${amount}`);
    }
  }
}

// 重构后：多态
class PaymentMethod {
  process(amount) {
    throw new Error('Process method must be implemented');
  }
}

class CreditCardPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing credit card payment of ${amount}`);
  }
}

class PayPalPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing PayPal payment of ${amount}`);
  }
}

class BankTransferPayment extends PaymentMethod {
  process(amount) {
    console.log(`Processing bank transfer of ${amount}`);
  }
}

class PaymentProcessor {
  process(paymentMethod, amount) {
    paymentMethod.process(amount);
  }
}
```

## 4. 使用卫语句（Guard Clauses）

提前返回，避免深层嵌套：

```javascript
// 重构前：深层嵌套
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // 主要逻辑
        return 'User processed';
      } else {
        return 'User does not have permission';
      }
    } else {
      return 'User is not active';
    }
  } else {
    return 'User not found';
  }
}

// 重构后：卫语句
function processUser(user) {
  if (!user) return 'User not found';
  if (!user.isActive) return 'User is not active';
  if (!user.hasPermission) return 'User does not have permission';
  
  // 主要逻辑
  return 'User processed';
}
```

## 5. 使用数组方法和函数式编程

```javascript
// 重构前：if-else 处理数组
function processOrders(orders) {
  const results = [];
  for (let order of orders) {
    if (order.status === 'PENDING') {
      results.push({...order, processed: true});
    } else if (order.status === 'SHIPPED') {
      results.push({...order, shipped: true});
    } else if (order.status === 'DELIVERED') {
      results.push({...order, delivered: true});
    }
  }
  return results;
}

// 重构后：使用数组方法
function processOrders(orders) {
  const processors = {
    PENDING: order => ({...order, processed: true}),
    SHIPPED: order => ({...order, shipped: true}),
    DELIVERED: order => ({...order, delivered: true})
  };

  return orders.map(order => {
    const processor = processors[order.status];
    return processor ? processor(order) : order;
  });
}
```

## 6. 使用命令模式（Command Pattern）

```javascript
// 重构前：if-else 执行不同命令
class CommandExecutor {
  execute(command, data) {
    if (command === 'CREATE') {
      return this.create(data);
    } else if (command === 'UPDATE') {
      return this.update(data);
    } else if (command === 'DELETE') {
      return this.delete(data);
    } else {
      throw new Error('Unknown command');
    }
  }
}

// 重构后：命令模式
class CommandExecutor {
  constructor() {
    this.commands = {
      CREATE: (data) => this.create(data),
      UPDATE: (data) => this.update(data),
      DELETE: (data) => this.delete(data)
    };
  }

  execute(command, data) {
    const cmd = this.commands[command];
    if (!cmd) {
      throw new Error('Unknown command');
    }
    return cmd(data);
  }
}
```

## 7. 使用工厂模式

```javascript
// 重构前：if-else 创建不同对象
function createUser(type, data) {
  if (type === 'ADMIN') {
    return new AdminUser(data);
  } else if (type === 'GUEST') {
    return new GuestUser(data);
  } else if (type === 'REGISTERED') {
    return new RegisteredUser(data);
  } else {
    throw new Error('Unknown user type');
  }
}

// 重构后：工厂模式
class UserFactory {
  static userTypes = {
    ADMIN: AdminUser,
    GUEST: GuestUser,
    REGISTERED: RegisteredUser
  };

  static create(type, data) {
    const UserClass = this.userTypes[type];
    if (!UserClass) {
      throw new Error('Unknown user type');
    }
    return new UserClass(data);
  }
}
```

## 总结

减少 if-else 的关键思想是：

1. **策略模式**：将条件逻辑封装到独立的策略中
2. **对象映射**：用数据结构替代条件判断
3. **多态**：利用面向对象的多态性处理不同行为
4. **卫语句**：提前返回，减少嵌套
5. **函数式方法**：利用数组方法和高阶函数
6. **设计模式**：运用合适的模式来组织代码逻辑

这些方法不仅减少了 if-else 的数量，还提高了代码的可读性、可维护性和可扩展性。