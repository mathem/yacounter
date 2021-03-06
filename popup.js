var BGPage = chrome.extension.getBackgroundPage();

function simple_timer(sec, block) {

  var date = new Date(sec),
    year = date.getUTCFullYear() - 1970,
    month = date.getUTCMonth(),
    day = date.getUTCDate() - 1,
    hour = date.getUTCHours(),
    minutes = date.getUTCMinutes(),
    seconds = date.getUTCSeconds();

  if (hour < 1) hour = 0;
  if (hour < 10) hour = '0' + hour;

  if (minutes < 1) minutes = 0;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  if (day < 1) {
    day = 0;
    block.innerHTML = hour + ':' + minutes + ':' + seconds;
  } else {
    block.innerHTML = day + 'd ' + hour + ':' + minutes + ':' + seconds;
  }

  if (month < 1) {
    month = 0;
  } else {
    block.innerHTML = month + 'm ' + day + 'd ' + hour + ':' + minutes + ':' + seconds;
  }

  if (year < 1) {
    year = 0;
  } else {
    block.innerHTML = year + 'y ' + month + 'm ' + day + 'd ' + hour + ':' + minutes + ':' + seconds;
  }

  sec = sec + 1000;

  id = setTimeout(function () {
    simple_timer(sec, block);
  }, 1000);
}

function start_timer() {
  clearTimeout(id);
  var block = document.getElementById('sample_timer');
  simple_timer(0, block);
}

function diff_time(d1, d2) {
  var current_date = d1;
  var option_date = d2;
  var diff = d1 - d2;
  var block = document.getElementById('sample_timer');
  simple_timer(diff, block);
}


//DOM

document.addEventListener('DOMContentLoaded', function () {

  var timerBlock = document.getElementById('sample_timer');
  var selectionView = document.querySelector('[name=mySelect]');

  var openPopupDate = +new Date();

  BGPage.getOptions(function (result) {
    for (var i = 0; i < result.length; i++) {
      var row = result.item(i);
      var newOption = document.createElement("option");
      newOption.value = row.id;
      newOption.text = row.options_name;
      selectionView.appendChild(newOption);
    }

    if (typeof(selectionView.options[BGPage.lastSelectOption]) != "undefined") {
      selectionView.options[BGPage.lastSelectOption].setAttribute('selected', 'selected');
    }
  });

  document.getElementsByClassName('open-table')[0].addEventListener('click', function (tabId) {
    chrome.browserAction.setPopup({popup: 'statistic.html'});
    window.location.href = "statistic.html";
  });

  if (BGPage.lastSelectOption == 0) {
    diff_time(openPopupDate, openPopupDate);
    clearTimeout(id);
  } else {
    diff_time(openPopupDate, BGPage.currentOptionDate);
  }

  selectionView.addEventListener('change', function () {
    var date = new Date(),
      month = date.getUTCMonth() + 1,
      day = date.getUTCDate(),
      year = date.getUTCFullYear();

    BGPage.newDate = year + "-" + month + "-" + day;

    var lastOptionDate = BGPage.currentOptionDate;

    var currentOptionDate = +new Date();

    if (BGPage.prevPeriod != 0) {
      BGPage.period = currentOptionDate - lastOptionDate - BGPage.prevPeriod;
      BGPage.prevPeriod = 0;
    } else {
      BGPage.period = currentOptionDate - lastOptionDate;
    }

    var option = this.options[this.value];
    for (var i = 0; i < this.options.length; i++) {
      this.options[i].removeAttribute('selected');
    }
    option.setAttribute('selected', 'selected');

    BGPage.currentOptionDate = currentOptionDate;

    if (this.value == 0) {
      timerBlock.innerHTML = '00:00:00';
      clearTimeout(id);
      chrome.browserAction.setIcon({path: "img/value-" + BGPage.lastSelectOption + ".png"});

      if (BGPage.lastSelectOption != 0) {
        chrome.browserAction.setIcon({path: "img/value-" + this.value + ".png"});
        BGPage.insertInStatistic(BGPage.newDate, BGPage.lastSelectOption, BGPage.period);
      }
    } else {

      if (BGPage.lastSelectOption != 0) {
        chrome.browserAction.setIcon({path: "img/value-" + this.value + ".png"});
        BGPage.insertInStatistic(BGPage.newDate, BGPage.lastSelectOption, BGPage.period);
      } else {
        chrome.browserAction.setIcon({path: "img/value-" + this.value + ".png"});
      }

      start_timer();
    }

    BGPage.lastSelectOption = this.value;

  });
});