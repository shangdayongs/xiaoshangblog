import {SidebarConfig4Multiple} from "vuepress/config";

import roadmapSideBar from "./sidebars/roadmapSideBar";
import algorithmmapSideBar from "./sidebars/algorithmmapSideBar";
import javaSideBar from "./sidebars/javaSideBar";
// @ts-ignore
export default {
    "/学习路线/": roadmapSideBar,
    "/数据结构与算法/": algorithmmapSideBar,
    "/JAVA/": javaSideBar,

    // 降级，默认根据文章标题渲染侧边栏
    "/": "auto",
} as SidebarConfig4Multiple;
