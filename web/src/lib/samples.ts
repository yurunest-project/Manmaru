import type { DatePlan } from "../types";

function day(year: number, month: number, date: number) {
  return new Date(year, month - 1, date);
}

export const samplePlans: DatePlan[] = [
  {
    id: "sample-1",
    date: day(2026, 8, 15),
    title: "水族館デート",
    memo: "午後からゆっくり。ペンギンのショーを見たい。",
    destinations: [
      {
        id: "d1",
        name: "サンシャイン水族館",
        address: "東京都豊島区東池袋3-1-3",
        latitude: 35.729,
        longitude: 139.7195,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-2",
    date: day(2026, 8, 23),
    title: "カフェ巡り",
    memo: "駅から歩けるお店を2軒。",
    destinations: [
      {
        id: "d2",
        name: "星乃珈琲店 吉祥寺店",
        address: "東京都武蔵野市吉祥寺本町1-8-10",
        latitude: 35.7032,
        longitude: 139.5798,
      },
      {
        id: "d3",
        name: "井の頭恩賜公園",
        address: "東京都武蔵野市御殿山1-18-31",
        latitude: 35.7002,
        longitude: 139.58,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-3",
    date: day(2026, 9, 5),
    title: "映画とディナー",
    memo: "夜は予約済み。",
    destinations: [
      {
        id: "d4",
        name: "TOHOシネマズ 新宿",
        address: "東京都新宿区歌舞伎町1-19-1",
        latitude: 35.6954,
        longitude: 139.702,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-4",
    date: day(2026, 7, 20),
    title: "花火",
    memo: "楽しかった！来年も行きたい。",
    destinations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
