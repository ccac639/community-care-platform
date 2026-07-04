export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/medical/index",
    "pages/food/index",
    "pages/disaster/index",
    "pages/community/index",
    "pages/welfare/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#4f46e5",
    navigationBarTitleText: "守望",
    navigationBarTextStyle: "white",
    backgroundColor: "#f5f7fa",
  },
  tabBar: {
    color: "#9ca3af",
    selectedColor: "#4f46e5",
    backgroundColor: "#ffffff",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
      },
      {
        pagePath: "pages/medical/index",
        text: "健康",
      },
      {
        pagePath: "pages/food/index",
        text: "生活",
      },
      {
        pagePath: "pages/disaster/index",
        text: "社会",
      },
      {
        pagePath: "pages/community/index",
        text: "心理",
      },
      {
        pagePath: "pages/welfare/index",
        text: "响应",
      },
    ],
  },
});
