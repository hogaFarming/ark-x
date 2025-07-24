// 完整的遗传算法 - 计算恐龙交配后所有可能的性状组合

// 性别类型
const Sex = {
  MALE: 'male',
  FEMALE: 'female'
};

// 示例数据
const data = [
  [1, 12, 16, 44, true, 'male'],
  [2, 42, 26, 95, true, 'male'],
  [3, 12, 16, 44, false, 'female'],
];

/**
 * 恐龙类
 */
class Dino {
  constructor(id, colors, sex, grownUp, nextMating = null) {
    this.id = id;
    this.colors = colors;
    this.sex = sex;
    this.grownUp = grownUp;
    this.nextMating = nextMating;
  }

  /**
   * 获取恐龙信息
   */
  getInfo() {
    return {
      id: this.id,
      traits: this.colors,
      sex: this.sex,
      grownUp: this.grownUp
    };
  }
}

/**
 * 交配对类
 */
class MatingCouple {
  constructor(male, female) {
    this.male = male;
    this.female = female;
  }

  /**
   * 计算两个恐龙交配后所有可能的性状组合
   */
  getAllPossibleOffspringTraits() {
    const maleTraits = this.male.colors;
    const femaleTraits = this.female.colors;
    const combinations = [];
    this.generateCombinations(maleTraits, femaleTraits, 0, [], combinations);
    return combinations;
  }
  
  /**
   * 递归生成所有可能的性状组合
   */
  generateCombinations(maleTraits, femaleTraits, index, currentCombination, allCombinations) {
    if (index >= maleTraits.length) {
      allCombinations.push([...currentCombination]);
      return;
    }
    
    // 遗传自父亲
    const maleTrait = maleTraits[index];
    currentCombination.push(maleTrait);
    this.generateCombinations(maleTraits, femaleTraits, index + 1, currentCombination, allCombinations);
    currentCombination.pop();
    
    // 遗传自母亲
    const femaleTrait = femaleTraits[index];
    currentCombination.push(femaleTrait);
    this.generateCombinations(maleTraits, femaleTraits, index + 1, currentCombination, allCombinations);
    currentCombination.pop();
  }
  
  /**
   * 计算特定性状的遗传概率
   */
  getTraitProbability(traitIndex, targetValue) {
    const maleTrait = this.male.colors[traitIndex];
    const femaleTrait = this.female.colors[traitIndex];
    
    let count = 0;
    if (maleTrait === targetValue) count++;
    if (femaleTrait === targetValue) count++;
    
    return count / 2; // 50%概率遗传自父亲或母亲
  }
  
  /**
   * 获取所有可能的性状组合及其概率
   */
  getOffspringTraitsWithProbability() {
    const combinations = this.getAllPossibleOffspringTraits();
    const totalCombinations = combinations.length;
    const probability = 1 / totalCombinations;
    
    return combinations.map(traits => ({
      traits,
      probability
    }));
  }

  /**
   * 获取交配对信息
   */
  getCoupleInfo() {
    return {
      male: this.male.getInfo(),
      female: this.female.getInfo()
    };
  }
}

/**
 * 交配组类
 */
class MatingGroup {
  constructor(couples = []) {
    this.couples = couples;
  }

  /**
   * 添加交配对
   */
  addCouple(couple) {
    this.couples.push(couple);
  }

  /**
   * 获取组内所有交配对的后代性状组合
   */
  getAllOffspringTraits() {
    const allTraits = [];
    
    for (const couple of this.couples) {
      const offspringTraits = couple.getAllPossibleOffspringTraits();
      allTraits.push(...offspringTraits);
    }
    
    return allTraits;
  }

  /**
   * 获取组内统计信息
   */
  getGroupStats() {
    const totalCouples = this.couples.length;
    const totalCombinations = this.getAllOffspringTraits().length;
    
    return {
      totalCouples,
      totalCombinations,
      averageCombinationsPerCouple: totalCombinations / totalCouples
    };
  }
}

/**
 * 从数据创建恐龙数组
 */
function createDinosFromData(data) {
  return data.map(dino => {
    return new Dino(dino[0], dino.slice(1, 4), dino[4], dino[5]);
  });
}

/**
 * 为纯色性状提供建议 - 推荐配对方案使后代尽可能接近纯色
 * @param {number} targetColor 目标颜色
 * @param {Array<Dino>} dinos 现有恐龙数组
 * @returns {Object} 推荐的配对方案
 */
function suggestForPureColor(targetColor, dinos) {
  // 分离公母恐龙
  const males = dinos.filter(dino => dino.sex === Sex.MALE);
  const females = dinos.filter(dino => dino.sex === Sex.FEMALE);
  
  console.log(`目标颜色: ${targetColor}`);
  console.log(`可用雄性恐龙: ${males.length}只`);
  console.log(`可用雌性恐龙: ${females.length}只`);
  
  if (males.length === 0 || females.length === 0) {
    return {
      targetColor,
      message: "没有足够的公母恐龙进行配对",
      recommendations: []
    };
  }
  
  // 计算每个恐龙的纯色度（目标颜色在性状中的占比）
  function calculateColorPurity(dino) {
    const targetColorCount = dino.colors.filter(color => color === targetColor).length;
    return {
      dino,
      purity: targetColorCount / dino.colors.length,
      targetColorCount,
      totalTraits: dino.colors.length
    };
  }
  
  // 计算配对的后代纯色度 - 优化算法
  function calculateOffspringPurity(male, female) {
    const couple = new MatingCouple(male, female);
    const allOffspring = couple.getAllPossibleOffspringTraits();
    
    let totalPurity = 0;
    let maxPurity = 0;
    let bestOffspring = null;
    let perfectOffspringCount = 0; // 完美纯色后代数量
    let highPurityOffspringCount = 0; // 高纯度后代数量（>=66.7%）
    
    allOffspring.forEach(offspring => {
      const targetColorCount = offspring.filter(color => color === targetColor).length;
      const purity = targetColorCount / offspring.length;
      totalPurity += purity;
      
      // 统计高纯度后代
      if (purity >= 2/3) { // 66.7%以上
        highPurityOffspringCount++;
      }
      if (purity === 1) { // 100%纯色
        perfectOffspringCount++;
      }
      
      if (purity > maxPurity) {
        maxPurity = purity;
        bestOffspring = offspring;
      }
    });
    
    const averagePurity = totalPurity / allOffspring.length;
    
    // 计算综合评分 - 考虑平均纯度、最大纯度、高纯度后代比例
    const highPurityRatio = highPurityOffspringCount / allOffspring.length;
    const perfectRatio = perfectOffspringCount / allOffspring.length;
    const compositeScore = (averagePurity * 0.4) + (maxPurity * 0.3) + (highPurityRatio * 0.2) + (perfectRatio * 0.1);
    
    return {
      male,
      female,
      averagePurity,
      maxPurity,
      bestOffspring,
      allOffspring,
      highPurityOffspringCount,
      perfectOffspringCount,
      highPurityRatio,
      perfectRatio,
      compositeScore
    };
  }
  
  // 计算所有可能的配对
  const allPairings = [];
  
  males.forEach(male => {
    females.forEach(female => {
      const pairing = calculateOffspringPurity(male, female);
      allPairings.push(pairing);
    });
  });
  
  // 按综合评分排序（而不是仅按平均纯度）
  allPairings.sort((a, b) => b.compositeScore - a.compositeScore);
  
  // 生成推荐方案（一公对多母）
  const recommendations = [];
  const usedFemales = new Set();
  
  males.forEach(male => {
    const malePairings = allPairings.filter(p => p.male.id === male.id);
    const availableFemales = malePairings.filter(p => !usedFemales.has(p.female.id));
    
    if (availableFemales.length > 0) {
      // 选择最佳的几个雌性配对
      const bestFemales = availableFemales
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, Math.min(3, availableFemales.length)); // 最多推荐3个雌性
      
      const recommendation = {
        male: male.getInfo(),
        females: bestFemales.map(p => ({
          female: p.female.getInfo(),
          averagePurity: p.averagePurity,
          maxPurity: p.maxPurity,
          bestOffspring: p.bestOffspring,
          highPurityOffspringCount: p.highPurityOffspringCount,
          perfectOffspringCount: p.perfectOffspringCount,
          highPurityRatio: p.highPurityRatio,
          perfectRatio: p.perfectRatio,
          compositeScore: p.compositeScore
        })),
        overallCompositeScore: bestFemales.reduce((sum, p) => sum + p.compositeScore, 0) / bestFemales.length
      };
      
      recommendations.push(recommendation);
      
      // 标记已使用的雌性
      bestFemales.forEach(p => usedFemales.add(p.female.id));
    }
  });
  
  // 按整体综合评分排序
  recommendations.sort((a, b) => b.overallCompositeScore - a.overallCompositeScore);
  
  return {
    targetColor,
    totalPairings: allPairings.length,
    recommendations,
    summary: {
      bestCompositeScore: recommendations.length > 0 ? recommendations[0].overallCompositeScore : 0,
      bestAveragePurity: Math.max(...allPairings.map(p => p.averagePurity)),
      bestMaxPurity: Math.max(...allPairings.map(p => p.maxPurity)),
      totalRecommendations: recommendations.length
    }
  };
}

/**
 * 格式化性状组合
 */
function formatTraits(traits) {
  return `[${traits.join(', ')}]`;
}

/**
 * 主函数 - 演示遗传算法功能
 */
function main() {
  console.log("=== 完整遗传算法演示 ===\n");

  // 创建示例恐龙
  const maleDino = new Dino("1", [12, 16, 44], Sex.MALE, true);
  const femaleDino = new Dino("2", [42, 26, 95], Sex.FEMALE, true);
  
  console.log("父亲恐龙:", maleDino.getInfo());
  console.log("母亲恐龙:", femaleDino.getInfo());
  
  // 创建交配对
  const couple = new MatingCouple(maleDino, femaleDino);
  
  // 获取所有可能的性状组合
  const allPossibleTraits = couple.getAllPossibleOffspringTraits();
  
  console.log("\n=== 所有可能的后代性状组合 ===");
  allPossibleTraits.forEach((traits, index) => {
    console.log(`组合 ${index + 1}: ${formatTraits(traits)}`);
  });
  
  console.log(`\n总共有 ${allPossibleTraits.length} 种可能的组合`);
  
  // 获取每个组合的概率
  const traitsWithProbability = couple.getOffspringTraitsWithProbability();
  console.log("\n=== 每个组合的概率 ===");
  traitsWithProbability.forEach((item, index) => {
    console.log(`组合 ${index + 1}: ${formatTraits(item.traits)} - 概率: ${(item.probability * 100).toFixed(2)}%`);
  });
  
  // 计算特定性状的遗传概率
  console.log("\n=== 特定性状的遗传概率 ===");
  for (let i = 0; i < 3; i++) {
    const maleTrait = maleDino.colors[i];
    const femaleTrait = femaleDino.colors[i];
    console.log(`性状 ${i + 1}: 父亲=${maleTrait}, 母亲=${femaleTrait}`);
    console.log(`  遗传父亲性状(${maleTrait})的概率: ${(couple.getTraitProbability(i, maleTrait) * 100).toFixed(2)}%`);
    console.log(`  遗传母亲性状(${femaleTrait})的概率: ${(couple.getTraitProbability(i, femaleTrait) * 100).toFixed(2)}%`);
  }
  
  // 验证组合数量
  const expectedCombinations = Math.pow(2, maleDino.colors.length);
  console.log(`\n=== 验证结果 ===`);
  console.log(`理论组合数量: 2^${maleDino.colors.length} = ${expectedCombinations}`);
  console.log(`实际组合数量: ${allPossibleTraits.length}`);
  console.log(`验证结果: ${expectedCombinations === allPossibleTraits.length ? '✓ 正确' : '✗ 错误'}`);

  // 演示交配组功能
  console.log("\n=== 交配组演示 ===");
  const group = new MatingGroup();
  group.addCouple(couple);
  
  // 添加另一个交配对
  const maleDino2 = new Dino("3", [10, 20, 30], Sex.MALE, true);
  const femaleDino2 = new Dino("4", [40, 50, 60], Sex.FEMALE, true);
  const couple2 = new MatingCouple(maleDino2, femaleDino2);
  group.addCouple(couple2);
  
  const groupStats = group.getGroupStats();
  console.log(`交配组统计:`, groupStats);
  
  // 演示从数据创建恐龙
  console.log("\n=== 从数据创建恐龙 ===");
  const dinosFromData = createDinosFromData(data);
  console.log(`从数据创建了 ${dinosFromData.length} 只恐龙`);
  dinosFromData.forEach((dino, index) => {
    console.log(`恐龙 ${index + 1}:`, dino.getInfo());
  });

  // 演示纯色建议功能
  console.log("\n=== 纯色建议演示 ===");
  
  // 创建更多测试数据
  const testDinos = [
    new Dino("1", [12, 12, 12], Sex.MALE, true),    // 纯色雄性
    new Dino("2", [12, 16, 44], Sex.MALE, true),    // 部分纯色雄性
    new Dino("3", [42, 26, 95], Sex.MALE, true),    // 非纯色雄性
    new Dino("4", [12, 12, 16], Sex.FEMALE, true),  // 高纯色雌性
    new Dino("5", [12, 26, 44], Sex.FEMALE, true),  // 部分纯色雌性
    new Dino("6", [42, 95, 16], Sex.FEMALE, true),  // 非纯色雌性
    new Dino("7", [12, 12, 12], Sex.FEMALE, true),  // 纯色雌性
  ];
  
  console.log("测试恐龙数据:");
  testDinos.forEach((dino, index) => {
    const targetColorCount = dino.colors.filter(color => color === 12).length;
    const purity = (targetColorCount / dino.colors.length * 100).toFixed(1);
    console.log(`  恐龙 ${index + 1}: ID=${dino.id}, 性状=${formatTraits(dino.colors)}, 性别=${dino.sex}, 颜色12纯度=${purity}%`);
  });
  
  const recommendations = suggestForPureColor(12, testDinos);
  
  console.log("\n=== 配对推荐结果 ===");
  console.log(`目标颜色: ${recommendations.targetColor}`);
  console.log(`总配对数量: ${recommendations.totalPairings}`);
  console.log(`推荐方案数量: ${recommendations.summary.totalRecommendations}`);
  console.log(`最佳综合评分: ${(recommendations.summary.bestCompositeScore * 100).toFixed(1)}%`);
  console.log(`最佳平均纯度: ${(recommendations.summary.bestAveragePurity * 100).toFixed(1)}%`);
  console.log(`最佳最大纯度: ${(recommendations.summary.bestMaxPurity * 100).toFixed(1)}%`);
  
  console.log("\n=== 详细推荐方案 ===");
  recommendations.recommendations.forEach((rec, index) => {
    console.log(`\n推荐方案 ${index + 1}:`);
    console.log(`  雄性恐龙: ID=${rec.male.id}, 性状=${formatTraits(rec.male.traits)}`);
    console.log(`  整体综合评分: ${(rec.overallCompositeScore * 100).toFixed(1)}%`);
    console.log(`  推荐雌性配对:`);
    
    rec.females.forEach((femaleRec, fIndex) => {
      console.log(`    雌性 ${fIndex + 1}: ID=${femaleRec.female.id}, 性状=${formatTraits(femaleRec.female.traits)}`);
      console.log(`      综合评分: ${(femaleRec.compositeScore * 100).toFixed(1)}%`);
      console.log(`      平均纯度: ${(femaleRec.averagePurity * 100).toFixed(1)}%`);
      console.log(`      最大纯度: ${(femaleRec.maxPurity * 100).toFixed(1)}%`);
      console.log(`      高纯度后代: ${femaleRec.highPurityOffspringCount}/8 (${(femaleRec.highPurityRatio * 100).toFixed(1)}%)`);
      console.log(`      完美后代: ${femaleRec.perfectOffspringCount} (${(femaleRec.perfectRatio * 100).toFixed(1)}%)`);
      console.log(`      最佳后代: ${formatTraits(femaleRec.bestOffspring)}`);
    });
  });
}

// 导出类和函数（如果在Node.js环境中使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Dino,
    MatingCouple,
    MatingGroup,
    Sex,
    createDinosFromData,
    suggestForPureColor,
    formatTraits,
    main
  };
}

// 运行演示
if (typeof window === 'undefined') {
  // 在Node.js环境中运行
  main();
} else {
  // 在浏览器环境中，将函数挂载到全局对象
  window.Genetics = {
    Dino,
    MatingCouple,
    MatingGroup,
    Sex,
    createDinosFromData,
    suggestForPureColor,
    formatTraits,
    main
  };
  console.log("遗传算法模块已加载到 window.Genetics");
} 