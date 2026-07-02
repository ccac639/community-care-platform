export interface Doctor {
  name: string;
  title: string;
  department: string;
  specialty: string;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  level: string;
  phone: string;
  lng: number;
  lat: number;
  departments: string[];
  recommendedDoctors: Doctor[];
}

export interface FoodItem {
  name: string;
  risk: "safe" | "warning" | "danger";
  desc: string;
}

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

export const hospitals: Hospital[] = [
  {
    id: "1",
    name: "北京协和医院",
    address: "东城区帅府园一号",
    distance: "2.3km",
    level: "三甲",
    phone: "010-69156114",
    lng: 116.417,
    lat: 39.917,
    departments: ["内分泌科", "骨科", "罕见病中心", "遗传学"],
    recommendedDoctors: [
      { name: "张教授", title: "主任医师", department: "罕见病中心", specialty: "成骨不全症、代谢性骨病" },
      { name: "李医生", title: "副主任医师", department: "骨科", specialty: "骨骼畸形矫正、骨折修复" },
    ],
  },
  {
    id: "2",
    name: "北京大学第一医院",
    address: "西城区西什库大街8号",
    distance: "3.1km",
    level: "三甲",
    phone: "010-83572211",
    lng: 116.382,
    lat: 39.928,
    departments: ["骨科", "遗传咨询门诊", "儿科", "神经内科"],
    recommendedDoctors: [
      { name: "王教授", title: "主任医师", department: "骨科", specialty: "成骨不全症、遗传性骨病" },
      { name: "赵医生", title: "副主任医师", department: "遗传咨询", specialty: "罕见病基因诊断" },
    ],
  },
  {
    id: "3",
    name: "中日友好医院",
    address: "朝阳区樱花园东街2号",
    distance: "4.5km",
    level: "三甲",
    phone: "010-84205566",
    lng: 116.425,
    lat: 39.972,
    departments: ["骨科", "呼吸与危重症", "神经内科", "风湿免疫科"],
    recommendedDoctors: [
      { name: "刘教授", title: "主任医师", department: "骨科", specialty: "骨关节病、骨代谢疾病" },
      { name: "陈医生", title: "副主任医师", department: "神经内科", specialty: "神经肌肉罕见病" },
    ],
  },
  {
    id: "4",
    name: "北京儿童医院",
    address: "西城区南礼士路56号",
    distance: "3.8km",
    level: "三甲",
    phone: "010-59616161",
    lng: 116.355,
    lat: 39.916,
    departments: ["骨科", "内分泌遗传代谢", "保健科", "新生儿科"],
    recommendedDoctors: [
      { name: "孙教授", title: "主任医师", department: "内分泌遗传代谢", specialty: "儿童成骨不全、遗传代谢病" },
      { name: "周医生", title: "副主任医师", department: "骨科", specialty: "儿童骨骼畸形、先天性骨病" },
    ],
  },
  {
    id: "5",
    name: "首都儿科研究所",
    address: "朝阳区雅宝路2号",
    distance: "3.2km",
    level: "三甲",
    phone: "010-85695555",
    lng: 116.439,
    lat: 39.918,
    departments: ["遗传室", "骨科", "神经内科", "内分泌科"],
    recommendedDoctors: [
      { name: "吴教授", title: "主任医师", department: "遗传室", specialty: "儿童罕见病基因诊断" },
      { name: "郑医生", title: "副主任医师", department: "骨科", specialty: "儿童骨发育异常" },
    ],
  },
];

export const rareDiseases = [
  { id: "1", name: "成骨不全症", alias: "脆骨病", probability: 87, affectedAreas: ["bone", "spine", "leg"] },
  { id: "2", name: "白化病", alias: "白斑病", probability: 23, affectedAreas: ["skin", "eye"] },
  { id: "3", name: "渐冻症", alias: "ALS", probability: 12, affectedAreas: ["spine", "arm", "leg"] },
];

export const foodAdditives = [
  { name: "三聚氰胺", risk: "danger" as const, desc: "有毒化工原料，严禁用于食品" },
  { name: "山梨酸钾", risk: "safe" as const, desc: "常用防腐剂，国标允许使用" },
  { name: "柠檬黄", risk: "warning" as const, desc: "人工色素，儿童需谨慎摄入" },
  { name: "安赛蜜", risk: "warning" as const, desc: "人工甜味剂，建议适量食用" },
];

export const quickPhrases = [
  "我今天有点不开心",
  "学习压力好大",
  "和朋友吵架了",
  "父母不理解我",
  "感觉很孤独",
];
