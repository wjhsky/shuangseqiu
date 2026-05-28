// 示例数据 - 最近20期双色球号码
const SAMPLE_DATA = [
    "03,12,25,31,32,33,06",
    "01,08,15,24,29,31,08",
    "05,14,22,27,30,32,10",
    "02,11,18,26,28,33,05",
    "04,13,21,25,31,32,12",
    "06,16,20,28,29,33,03",
    "07,15,24,26,30,31,09",
    "09,17,19,27,32,33,07",
    "08,12,23,25,28,30,11",
    "10,14,21,29,31,33,04",
    "11,18,22,26,27,32,14",
    "03,13,20,24,31,33,06",
    "05,16,25,28,29,32,08",
    "02,12,19,27,30,31,10",
    "04,15,23,26,28,33,02",
    "07,17,24,25,32,33,13",
    "06,14,21,29,30,31,09",
    "08,16,20,27,28,32,11",
    "09,13,22,26,31,33,05",
    "10,18,25,28,29,30,12"
];

// 双色球号码范围
const RED_BALL_RANGE = 33;  // 红球 01-33
const BLUE_BALL_RANGE = 16; // 蓝球 01-16

/**
 * 解析号码字符串
 * @param {string} dataString - 号码字符串，格式: "01,02,03,04,05,06,07"
 * @returns {object} {red: [6个红球号码], blue: 蓝球号码}
 */
function parseNumbers(dataString) {
    const numbers = dataString.trim().split(',').map(n => parseInt(n.trim()));
    if (numbers.length !== 7) {
        throw new Error('号码格式错误，应该包含6个红球和1个蓝球');
    }
    return {
        red: numbers.slice(0, 6),
        blue: numbers[6]
    };
}

/**
 * 验证号码是否有效
 * @param {object} numbers - 解析后的号码对象
 * @returns {boolean}
 */
function isValidNumbers(numbers) {
    // 验证红球
    for (let num of numbers.red) {
        if (num < 1 || num > RED_BALL_RANGE) {
            return false;
        }
    }
    // 验证蓝球
    if (numbers.blue < 1 || numbers.blue > BLUE_BALL_RANGE) {
        return false;
    }
    return true;
}

/**
 * 加载示例数据
 */
function loadSampleData() {
    document.getElementById('historyData').value = SAMPLE_DATA.join('\n');
}

/**
 * 格式化号码为两位数字
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return String(num).padStart(2, '0');
}

/**
 * 获取所有历史数据
 * @returns {array}
 */
function parseAllData() {
    const textarea = document.getElementById('historyData');
    const lines = textarea.value.trim().split('\n').filter(line => line.trim());
    
    const allData = [];
    const errors = [];
    
    lines.forEach((line, index) => {
        try {
            const numbers = parseNumbers(line);
            if (!isValidNumbers(numbers)) {
                errors.push(`第 ${index + 1} 行：号码超出范围`);
                return;
            }
            allData.push(numbers);
        } catch (e) {
            errors.push(`第 ${index + 1} 行：${e.message}`);
        }
    });
    
    if (errors.length > 0) {
        alert('数据验证失败：\n' + errors.join('\n'));
        return null;
    }
    
    if (allData.length < 1) {
        alert('请输入至少1期的号码数据');
        return null;
    }
    
    return allData;
}

/**
 * 统计位置上的号码频次
 * @param {array} allData - 所有号码数据
 * @param {number} position - 位置 (0-5为红球第1-6位, 6为蓝球)
 * @returns {object} {频次统计, 总期数}
 */
function getPositionFrequency(allData, position) {
    const frequency = {};
    
    allData.forEach(data => {
        const num = position < 6 ? data.red[position] : data.blue;
        frequency[num] = (frequency[num] || 0) + 1;
    });
    
    return frequency;
}

/**
 * 获取排序后的频次数据
 * @param {object} frequency
 * @returns {array} [{ number, count }, ...]
 */
function getSortedFrequency(frequency) {
    return Object.entries(frequency)
        .map(([num, count]) => ({
            number: parseInt(num),
            count: count
        }))
        .sort((a, b) => b.count - a.count || a.number - b.number);
}

/**
 * 获取热点号码 (出现3次及以上)
 * @param {object} frequency
 * @returns {array}
 */
function getHotNumbers(frequency) {
    return Object.entries(frequency)
        .filter(([_, count]) => count >= 3)
        .map(([num, _]) => parseInt(num))
        .sort((a, b) => a - b);
}

/**
 * 获取冷号 (出现0-1次)
 * @param {object} frequency
 * @param {number} maxNum - 最大号码
 * @returns {array}
 */
function getColdNumbers(frequency, maxNum) {
    const cold = [];
    for (let i = 1; i <= maxNum; i++) {
        if (!frequency[i] || frequency[i] <= 1) {
            cold.push(i);
        }
    }
    return cold;
}

/**
 * 从冷号中随机选择推荐
 * @param {array} coldNumbers
 * @param {number} count
 * @returns {array}
 */
function selectRandomFromCold(coldNumbers, count) {
    if (coldNumbers.length === 0) {
        return [];
    }
    const shuffled = [...coldNumbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 根据分析数据生成预测建议
 * @param {array} allData
 * @returns {object}
 */
function generatePrediction(allData) {
    const redSuggestion = [];
    const hotNumbers = {};
    
    // 分析红球6位
    for (let pos = 0; pos < 6; pos++) {
        const frequency = getPositionFrequency(allData, pos);
        const sorted = getSortedFrequency(frequency);
        
        // 取频次最高的作为候选
        if (sorted.length > 0) {
            const topNumber = sorted[0].number;
            if (!redSuggestion.includes(topNumber)) {
                redSuggestion.push(topNumber);
                hotNumbers[topNumber] = (hotNumbers[topNumber] || 0) + 1;
            }
        }
    }
    
    // 如果不足6个，补充其他热号
    if (redSuggestion.length < 6) {
        for (let pos = 0; pos < 6; pos++) {
            if (redSuggestion.length >= 6) break;
            const frequency = getPositionFrequency(allData, pos);
            const sorted = getSortedFrequency(frequency);
            
            for (let item of sorted) {
                if (!redSuggestion.includes(item.number)) {
                    redSuggestion.push(item.number);
                    if (redSuggestion.length >= 6) break;
                }
            }
        }
    }
    
    // 排序红球
    redSuggestion.sort((a, b) => a - b);
    
    // 分析蓝球
    const blueFrequency = getPositionFrequency(allData, 6);
    const blueSorted = getSortedFrequency(blueFrequency);
    const blueSuggestion = blueSorted.length > 0 ? blueSorted[0].number : Math.floor(Math.random() * BLUE_BALL_RANGE) + 1;
    
    return {
        red: redSuggestion.slice(0, 6),
        blue: blueSuggestion
    };
}