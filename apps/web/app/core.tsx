type Sex = 'male' | 'female';

const data = [
  [1, 12, 16, 44, true, 'male'],
  [2, 42, 26, 95, true, 'male'],
  [3, 12, 16, 44, false, 'female'],
];

class Dino {
  constructor(
    public readonly id: string,
    public readonly colors: number[],
    public readonly sex: Sex,
    public readonly grownUp: boolean,
    public readonly nextMating?: Date,
  ) {}
}

class MatingCouple {
  constructor(
    public readonly male: Dino,
    public readonly female: Dino,
  ) {}

  /**
   * 计算两个恐龙交配后所有可能的性状组合
   * 每个性状有50%概率遗传自父亲或母亲
   * @returns 所有可能的性状组合数组
   */
  public getAllPossibleOffspringTraits(): number[][] {
    const maleTraits = this.male.colors;
    const femaleTraits = this.female.colors;
    
    // 生成所有可能的组合
    const combinations: number[][] = [];
    
    // 使用递归生成所有可能的组合
    this.generateCombinations(maleTraits, femaleTraits, 0, [], combinations);
    
    return combinations;
  }
  
  /**
   * 递归生成所有可能的性状组合
   * @param maleTraits 父亲的性状
   * @param femaleTraits 母亲的性状
   * @param index 当前处理的性状索引
   * @param currentCombination 当前组合
   * @param allCombinations 所有组合的数组
   */
  private generateCombinations(
    maleTraits: number[],
    femaleTraits: number[],
    index: number,
    currentCombination: number[],
    allCombinations: number[][]
  ): void {
    // 如果已经处理完所有性状，添加当前组合
    if (index >= maleTraits.length) {
      allCombinations.push([...currentCombination]);
      return;
    }
    
    // 对于每个性状，有50%概率遗传自父亲或母亲
    // 遗传自父亲
    const maleTrait = maleTraits[index];
    if (maleTrait !== undefined) {
      currentCombination.push(maleTrait);
      this.generateCombinations(maleTraits, femaleTraits, index + 1, currentCombination, allCombinations);
      currentCombination.pop();
    }
    
    // 遗传自母亲
    const femaleTrait = femaleTraits[index];
    if (femaleTrait !== undefined) {
      currentCombination.push(femaleTrait);
      this.generateCombinations(maleTraits, femaleTraits, index + 1, currentCombination, allCombinations);
      currentCombination.pop();
    }
  }
  
  /**
   * 计算特定性状的遗传概率
   * @param traitIndex 性状索引
   * @param targetValue 目标性状值
   * @returns 概率（0-1之间）
   */
  public getTraitProbability(traitIndex: number, targetValue: number): number {
    const maleTrait = this.male.colors[traitIndex];
    const femaleTrait = this.female.colors[traitIndex];
    
    let count = 0;
    if (maleTrait !== undefined && maleTrait === targetValue) count++;
    if (femaleTrait !== undefined && femaleTrait === targetValue) count++;
    
    return count / 2; // 50%概率遗传自父亲或母亲
  }
  
  /**
   * 获取所有可能的性状组合及其概率
   * @returns 性状组合和对应的概率
   */
  public getOffspringTraitsWithProbability(): Array<{traits: number[], probability: number}> {
    const combinations = this.getAllPossibleOffspringTraits();
    const totalCombinations = combinations.length;
    const probability = 1 / totalCombinations; // 每个组合概率相等
    
    return combinations.map(traits => ({
      traits,
      probability
    }));
  }
}

class MatingGroup {
  constructor(
    public readonly couples: MatingCouple[]
  ) {}
  
  /**
   * 获取组内所有交配对的后代性状组合
   */
  public getAllOffspringTraits(): number[][] {
    const allTraits: number[][] = [];
    
    for (const couple of this.couples) {
      const offspringTraits = couple.getAllPossibleOffspringTraits();
      allTraits.push(...offspringTraits);
    }
    
    return allTraits;
  }
}

class MatingPlan {
  constructor(
    public groups: Dino[],
  ) {}
}

const dinos = data.map((dino: any) => {
  return new Dino(dino[0], dino.slice(1, 4), dino[4], dino[5]);
});

function suggestForPureColor(color: number) {
  const _dions = dinos.filter((dino: Dino) => {
    return dino.colors.includes(color);
  });
}

function main() {
  // 创建示例恐龙
  const maleDino = new Dino("1", [12, 16, 44], 'male', true);
  const femaleDino = new Dino("2", [42, 26, 95], 'female', true);
  
  // 创建交配对
  const couple = new MatingCouple(maleDino, femaleDino);
  
  // 获取所有可能的性状组合
  const allPossibleTraits = couple.getAllPossibleOffspringTraits();
  
  console.log("父亲性状:", maleDino.colors);
  console.log("母亲性状:", femaleDino.colors);
  console.log("所有可能的后代性状组合:");
  
  allPossibleTraits.forEach((traits, index) => {
    console.log(`组合 ${index + 1}: [${traits.join(', ')}]`);
  });
  
  console.log(`总共有 ${allPossibleTraits.length} 种可能的组合`);
  
  // 获取每个组合的概率
  const traitsWithProbability = couple.getOffspringTraitsWithProbability();
  console.log("\n每个组合的概率:");
  traitsWithProbability.forEach((item, index) => {
    console.log(`组合 ${index + 1}: [${item.traits.join(', ')}] - 概率: ${(item.probability * 100).toFixed(2)}%`);
  });
  
  // 计算特定性状的遗传概率
  console.log("\n特定性状的遗传概率:");
  for (let i = 0; i < 3; i++) {
    const maleTrait = maleDino.colors[i];
    const femaleTrait = femaleDino.colors[i];
    console.log(`性状 ${i + 1}: 父亲=${maleTrait}, 母亲=${femaleTrait}`);
    if (maleTrait !== undefined) {
      console.log(`  遗传父亲性状(${maleTrait})的概率: ${(couple.getTraitProbability(i, maleTrait) * 100).toFixed(2)}%`);
    }
    if (femaleTrait !== undefined) {
      console.log(`  遗传母亲性状(${femaleTrait})的概率: ${(couple.getTraitProbability(i, femaleTrait) * 100).toFixed(2)}%`);
    }
  }
}

// 运行示例
main();


