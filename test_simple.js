// 简化版随机恐龙测试
const { Dino, MatingCouple, Sex, suggestForPureColor, formatTraits } = require('./genetics_complete.js');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDino(id, sex) {
  const colors = [
    getRandomInt(1, 100),
    getRandomInt(1, 100),
    getRandomInt(1, 100)
  ];
  return new Dino(id, colors, sex, true);
}

function main() {
  console.log("=== 100个随机恐龙测试 ===\n");
  
  // 生成100个随机恐龙
  const dinos = [];
  for (let i = 1; i <= 50; i++) {
    dinos.push(generateRandomDino(`M${i}`, Sex.MALE));
  }
  for (let i = 1; i <= 50; i++) {
    dinos.push(generateRandomDino(`F${i}`, Sex.FEMALE));
  }
  
  // 随机选择目标颜色
  const targetColor = getRandomInt(1, 100);
  console.log(`🎯 目标颜色: ${targetColor}`);
  console.log(`📊 恐龙总数: ${dinos.length}只 (50公50母)`);
  
  // 统计纯度分布
  const purityStats = dinos.map(dino => {
    const targetColorCount = dino.colors.filter(color => color === targetColor).length;
    const purity = targetColorCount / dino.colors.length;
    return { dino, purity, targetColorCount };
  });
  
  const perfectCount = purityStats.filter(s => s.purity === 1).length;
  const highPurityCount = purityStats.filter(s => s.purity >= 2/3 && s.purity < 1).length;
  const mediumPurityCount = purityStats.filter(s => s.purity >= 1/3 && s.purity < 2/3).length;
  const lowPurityCount = purityStats.filter(s => s.purity > 0 && s.purity < 1/3).length;
  const zeroPurityCount = purityStats.filter(s => s.purity === 0).length;
  
  console.log(`\n📈 纯度分布:`);
  console.log(`  完美纯色 (100%): ${perfectCount}只`);
  console.log(`  高纯度 (66.7%-99.9%): ${highPurityCount}只`);
  console.log(`  中等纯度 (33.3%-66.6%): ${mediumPurityCount}只`);
  console.log(`  低纯度 (1%-33.2%): ${lowPurityCount}只`);
  console.log(`  无目标颜色 (0%): ${zeroPurityCount}只`);
  
  // 测试算法
  console.log("\n🔍 测试suggestForPureColor方法...");
  const startTime = Date.now();
  const recommendations = suggestForPureColor(targetColor, dinos);
  const endTime = Date.now();
  
  console.log(`\n⚡ 执行时间: ${endTime - startTime}ms`);
  console.log(`📊 总配对数量: ${recommendations.totalPairings}`);
  console.log(`🏆 推荐方案数量: ${recommendations.summary.totalRecommendations}`);
  console.log(`🎯 最佳综合评分: ${(recommendations.summary.bestCompositeScore * 100).toFixed(1)}%`);
  console.log(`📈 最佳平均纯度: ${(recommendations.summary.bestAveragePurity * 100).toFixed(1)}%`);
  console.log(`🌟 最佳最大纯度: ${(recommendations.summary.bestMaxPurity * 100).toFixed(1)}%`);
  
  // 显示最佳推荐方案
  if (recommendations.recommendations.length > 0) {
    const bestRec = recommendations.recommendations[0];
    console.log(`\n🏆 最佳推荐方案:`);
    console.log(`   🐲 雄性: ${bestRec.male.id} - ${formatTraits(bestRec.male.traits)}`);
    console.log(`   📊 综合评分: ${(bestRec.overallCompositeScore * 100).toFixed(1)}%`);
    console.log(`   👥 推荐雌性数量: ${bestRec.females.length}`);
    
    if (bestRec.females.length > 0) {
      const bestFemale = bestRec.females[0];
      console.log(`   🏅 最佳雌性: ${bestFemale.female.id} - ${formatTraits(bestFemale.female.traits)}`);
      console.log(`      📈 综合评分: ${(bestFemale.compositeScore * 100).toFixed(1)}%`);
      console.log(`      📊 平均纯度: ${(bestFemale.averagePurity * 100).toFixed(1)}%`);
      console.log(`      🎯 最大纯度: ${(bestFemale.maxPurity * 100).toFixed(1)}%`);
      console.log(`      🌟 高纯度后代: ${bestFemale.highPurityOffspringCount}/8 (${(bestFemale.highPurityRatio * 100).toFixed(1)}%)`);
      console.log(`      💎 完美后代: ${bestFemale.perfectOffspringCount} (${(bestFemale.perfectRatio * 100).toFixed(1)}%)`);
    }
  }
  
  // 算法效果评估
  console.log(`\n🎯 算法效果评估:`);
  if (recommendations.summary.bestMaxPurity === 1) {
    console.log("✅ 成功找到可产生100%纯色后代的配对");
  } else if (recommendations.summary.bestMaxPurity >= 2/3) {
    console.log("✅ 成功找到可产生高纯度后代(≥66.7%)的配对");
  } else if (recommendations.summary.bestMaxPurity >= 1/3) {
    console.log("⚠️  找到可产生中等纯度后代(≥33.3%)的配对");
  } else {
    console.log("❌ 未能找到高纯度后代配对");
  }
  
  console.log(`• 性能: ${(endTime - startTime / recommendations.totalPairings).toFixed(2)}ms/配对`);
  console.log(`• 覆盖率: ${recommendations.summary.totalRecommendations}/50个雄性`);
}

main(); 