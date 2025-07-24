// 遗传算法 - 计算恐龙交配后所有可能的性状组合

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
}

/**
 * 主函数 - 演示遗传算法功能
 */
function main() {
  console.log("=== 遗传算法演示 ===\n");

  // 创建示例恐龙
  const maleDino = new Dino("1", [12, 16, 44], Sex.MALE, true);
  const femaleDino = new Dino("2", [42, 26, 95], Sex.FEMALE, true);
  
  console.log("父亲性状:", maleDino.colors);
  console.log("母亲性状:", femaleDino.colors);
  
  // 创建交配对
  const couple = new MatingCouple(maleDino, femaleDino);
  
  // 获取所有可能的性状组合
  const allPossibleTraits = couple.getAllPossibleOffspringTraits();
  
  console.log("\n=== 所有可能的后代性状组合 ===");
  allPossibleTraits.forEach((traits, index) => {
    console.log(`组合 ${index + 1}: [${traits.join(', ')}]`);
  });
  
  console.log(`\n总共有 ${allPossibleTraits.length} 种可能的组合`);
  
  // 获取每个组合的概率
  const traitsWithProbability = couple.getOffspringTraitsWithProbability();
  console.log("\n=== 每个组合的概率 ===");
  traitsWithProbability.forEach((item, index) => {
    console.log(`组合 ${index + 1}: [${item.traits.join(', ')}] - 概率: ${(item.probability * 100).toFixed(2)}%`);
  });
  
  // 验证组合数量
  const expectedCombinations = Math.pow(2, maleDino.colors.length);
  console.log(`\n=== 验证结果 ===`);
  console.log(`理论组合数量: 2^${maleDino.colors.length} = ${expectedCombinations}`);
  console.log(`实际组合数量: ${allPossibleTraits.length}`);
  console.log(`验证结果: ${expectedCombinations === allPossibleTraits.length ? '✓ 正确' : '✗ 错误'}`);
}

// 运行演示
main(); 