/**
 * @author 'Dancy'
 * @description '侧边栏配置项'
 */

import { Sidebar } from "./type/sidebar.mts";

import Html from "../src/guide/html/sidebar.mts";
import Css from "../src/guide/css/sidebar.mts";
import JavaScript from "../src/guide/javascript/sidebar.mts";
import Vue from "../src/guide/vue/sidebar.mts";
import React from "../src/guide/react/sidebar.mts";
import Node from "../src/guide/node/sidebar.mts";
import BuildTool from "../src/guide/build-tool/sidebar.mts";
import Network from "../src/guide/network/sidebar.mts";
import Browser from "../src/guide/browser/sidebar.mts";
import DataStructureAlgorithm from "../src/guide/data-structure-algorithm/sidebar.mts";

export const sidebar: Sidebar = {
  "/guide/html/": Html,
  "/guide/css/": Css,
  "/guide/javascript/": JavaScript,
  "/guide/vue/": Vue,
  "/guide/react/": React,
  "/guide/node/": Node,
  "/guide/build-tool/": BuildTool,
  "/guide/network/": Network,
  "/guide/browser/": Browser,
  "/guide/data-structure-algorithm/": DataStructureAlgorithm,
};
