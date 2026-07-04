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
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home-active.png",
      },
      {
        pagePath: "pages/medical/index",
        text: "健康",
        iconPath: "assets/icons/medical.png",
        selectedIconPath: "assets/icons/medical-active.png",
      },
      {
        pagePath: "pages/food/index",
        text: "生活",
        iconPath: "assets/icons/food.png",
        selectedIconPath: "assets/icons/food-active.png",
      },
      {
        pagePath: "pages/disaster/index",
        text: "社会",
        iconPath: "assets/icons/disaster.png",
        selectedIconPath: "assets/icons/disaster-active.png",
      },
      {
        pagePath: "pages/community/index",
        text: "心理",
        iconPath: "assets/icons/community.png",
        selectedIconPath: "assets/icons/community-active.png",
      },
      {
        pagePath: "pages/welfare/index",
        text: "响应",
        iconPath: "assets/icons/welfare.png",
        selectedIconPath: "assets/icons/welfare-active.png",
      },
    ],
  },
});
