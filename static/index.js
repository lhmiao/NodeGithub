let barChart = echarts.init(document.querySelector('#barChart'));
let treeMap = echarts.init(document.querySelector('#treeMap'));

let searchButton = document.querySelector("#searchButton");
let searchInput = document.querySelector('#searchInput');
let loading = document.querySelector('#loading');
let showPlace = document.querySelector('#showPlace');
let message = document.querySelector('#message');

let xhr = new XMLHttpRequest();
let url = '/repository';

xhr.addEventListener('load', () => {
  loading.style.visibility = '';
  if((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 304)) {
    //处理响应数据xhr.responseText
    let responseData = JSON.parse(xhr.responseText);
    if(responseData.errCode != 0) {
      alertMessage('查找失败，错误信息：' + responseData.errMsg);
    }
    //解析数据生成barChart
    let keyArray = [],
        valueArray = [];
    for(let key in responseData.data) {
      keyArray.unshift(key);
      valueArray.unshift(+responseData.data[key]);
    }
    createBarChart(keyArray, valueArray);
    //解析数据生成treeMap
    let nameValueObjectArray = [];
    for(let i=0;i<keyArray.length;i++) {
      nameValueObjectArray.push({
        name: keyArray[i],
        value: valueArray[i]
      });
    }
    createTreeMap(nameValueObjectArray);
    showPlace.style.display = 'flex';
    //将搜索的记录缓存到本次会话结束
    let optionData = JSON.stringify({
      keyArray,
      valueArray,
      nameValueObjectArray
    });
    sessionStorage[searchInput.value] = optionData;
  }
  else {
    alertMessage('响应失败，响应代码：' + xhr.status);
  }
}, false);

searchButton.addEventListener('click', () => {
  let searchValue = searchInput.value;
  if(searchValue === '') {
    alertMessage('请输入内容后再进行搜索');
    return;
  }
  if(sessionStorage[searchValue] != undefined) {
    let optionData = JSON.parse(sessionStorage[searchValue]);
    let keyArray = optionData.keyArray;
    let valueArray = optionData.valueArray;
    createBarChart(keyArray, valueArray);
    let nameValueObjectArray = optionData.nameValueObjectArray;
    createTreeMap(nameValueObjectArray);
    showPlace.style.display = 'flex';
    return;
  }
  const searchData = `repository=${searchValue}`;
  xhr.open('post', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(searchData);
  loading.style.visibility = 'visible';
}, false);

searchInput.addEventListener('keyup', (e) => {
  //如果按下回车键，相当于点搜索
  if(e.keyCode === 13) {
    searchButton.click();
  }
}, false);

function createBarChart(keyArray, valueArray) {
  let option = {
    title: {
      text: searchInput.value,
      subtext: '数据来源于GitHub'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data:['相关仓库数量']
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: keyArray
    },
    series: [{
      name: '相关仓库数量',
      type: 'bar',
      data: valueArray
    }],
    color: ['#38f']
  };
  barChart.setOption(option);
}

function createTreeMap(nameValueObjectArray) {
  let option = {
    title: {
      text: searchInput.value,
      subtext: '数据来源于GitHub'
    },
    tooltip: {
      formatter: '{b}<br>相关仓库数量：{c}'
    },
    series: [{
      name: '相关仓库数量',
      type: 'treemap',
      data: nameValueObjectArray
    }]
  };
  treeMap.setOption(option);
}

function alertMessage(msg) {
  let text = message.querySelector('span');
  text.innerText = msg;
  message.style.cssText = 'visibility: visible; animation: alertMsg-appear 0.6s;';
  setTimeout(() => {
    message.style.animation = '';
  }, 600);
  setTimeout(() => {
    message.style.animation = 'alertMsg-appear 0.6s reverse';
  }, 3600);
  setTimeout(() => {
    message.style.cssText = '';
  }, 4200);
}