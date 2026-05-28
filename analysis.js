// 全局变量存储图表实例
const charts = {};

// 页面加载时绑定事件
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadSampleData').addEventListener('click', loadSampleData);
    document.getElementById('analyzeData').addEventListener('click', analyzeData);
});

/**
 * 主分析函数
 */
function analyzeData() {
    // 解析数据
    const allData = parseAllData();
    if (!allData) return;
    
    // ��示结果区域
    document.getElementById('resultSection').style.display = 'block';
    
    // 滚动到结果区域
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    
    // 更新统计信息
    updateStatistics(allData);
    
    // 更新逐位分析
    updatePositionAnalysis(allData);
    
    // 生成预测建议
    generateAndDisplayPrediction(allData);
    
    // 显示数据表
    displayDataTable(allData);
}

/**
 * 更新统计信息
 */
function updateStatistics(allData) {
    document.getElementById('totalPeriods').textContent = allData.length;
    document.getElementById('dataIntegrity').textContent = '100%';
}

/**
 * 更新逐位分析
 */
function updatePositionAnalysis(allData) {
    const period = allData.length;
    
    // 分析红球6位
    for (let pos = 0; pos < 6; pos++) {
        const frequency = getPositionFrequency(allData, pos);
        const sorted = getSortedFrequency(frequency);
        const hotNumbers = getHotNumbers(frequency);
        const coldNumbers = getColdNumbers(frequency, RED_BALL_RANGE);
        
        // 更新显示
        const highestNum = sorted[0];
        document.getElementById(`pos${pos+1}High`).textContent = formatNumber(highestNum.number);
        document.getElementById(`pos${pos+1}Count`).textContent = highestNum.count;
        document.getElementById(`pos${pos+1}Hot`).textContent = hotNumbers.length > 0 ? hotNumbers.map(formatNumber).join(', ') : '暂无';
        document.getElementById(`pos${pos+1}Cold`).textContent = coldNumbers.length > 0 ? coldNumbers.slice(0, 5).map(formatNumber).join(', ') + '...' : '暂无';
        
        // 绘制图表
        drawPositionChart(pos, frequency);
    }
    
    // 分析蓝球
    const blueFrequency = getPositionFrequency(allData, 6);
    const blueSorted = getSortedFrequency(blueFrequency);
    const blueHotNumbers = getHotNumbers(blueFrequency);
    const blueColdNumbers = getColdNumbers(blueFrequency, BLUE_BALL_RANGE);
    
    document.getElementById('blueBallHigh').textContent = formatNumber(blueSorted[0].number);
    document.getElementById('blueBallCount').textContent = blueSorted[0].count;
    document.getElementById('blueBallHot').textContent = blueHotNumbers.length > 0 ? blueHotNumbers.map(formatNumber).join(', ') : '暂无';
    document.getElementById('blueBallCold').textContent = blueColdNumbers.length > 0 ? blueColdNumbers.slice(0, 5).map(formatNumber).join(', ') + '...' : '暂无';
    
    drawPositionChart(6, blueFrequency);
}

/**
 * 绘制位置分析图表
 */
function drawPositionChart(position, frequency) {
    const canvasId = position < 6 ? `position${position+1}Chart` : 'blueBallChart';
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // 销毁旧图表
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    // 准备数据
    const sorted = getSortedFrequency(frequency);
    const maxNum = position < 6 ? RED_BALL_RANGE : BLUE_BALL_RANGE;
    
    // 获取前10个最频繁的号码
    const topNumbers = sorted.slice(0, 10);
    
    // 补充其他未出现的号码
    const displayNumbers = [...topNumbers];
    for (let i = 1; i <= maxNum && displayNumbers.length < 10; i++) {
        if (!displayNumbers.some(item => item.number === i)) {
            displayNumbers.push({ number: i, count: 0 });
        }
    }
    displayNumbers.sort((a, b) => a.number - b.number);
    
    const labels = displayNumbers.map(item => formatNumber(item.number));
    const data = displayNumbers.map(item => item.count);
    
    // 创建新图表
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '出现次数',
                data: data,
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',  // 红色
                    'rgba(52, 152, 219, 0.7)', // 蓝色
                    'rgba(46, 204, 113, 0.7)', // 绿色
                    'rgba(241, 196, 15, 0.7)', // 黄色
                    'rgba(155, 89, 182, 0.7)', // 紫色
                    'rgba(230, 126, 34, 0.7)', // 橙色
                    'rgba(26, 188, 156, 0.7)', // 青绿色
                    'rgba(44, 62, 80, 0.7)',   // 暗灰色
                    'rgba(189, 195, 199, 0.7)',// 浅灰色
                    'rgba(192, 57, 43, 0.7)'   // 暗红色
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(230, 126, 34, 1)',
                    'rgba(26, 188, 156, 1)',
                    'rgba(44, 62, 80, 1)',
                    'rgba(189, 195, 199, 1)',
                    'rgba(192, 57, 43, 1)'
                ],
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * 生成并显示预测建议
 */
function generateAndDisplayPrediction(allData) {
    const prediction = generatePrediction(allData);
    
    // 格式化输出
    const redFormatted = prediction.red.map(formatNumber).join(' ');
    const blueFormatted = formatNumber(prediction.blue);
    
    document.getElementById('redSuggestion').textContent = redFormatted;
    document.getElementById('blueSuggestion').textContent = blueFormatted;
}

/**
 * 显示数据表
 */
function displayDataTable(allData) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    allData.forEach((data, index) => {
        const row = document.createElement('tr');
        const redBalls = data.red.map(formatNumber).join(', ');
        const blueBall = formatNumber(data.blue);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${redBalls}</td>
            <td><span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px;">${blueBall}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}