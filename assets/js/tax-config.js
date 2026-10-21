// 稅制參數：民國115年（2026）贈與稅。每年11月底財政部公告次年數值，僅需更新此檔。
window.TAX = {
  year: 115,
  gift: {
    exemption: 244,
    brackets: [{upTo: 2811, rate: .10, base: 0}, {upTo: 5621, rate: .15, base: 281.1}, {upTo: Infinity, rate: .20, base: 702.6}]
  },
  defaults: {discountRate: 1.725, usd: 31.5, jpy: 0.21, yieldRate: 5}
};
