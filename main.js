/**
 * @name       自动健康上报
 * @author     VincentGe
 * @version    2.0.0
 */

/**
 * 断言，是否root
 */
const hasRoot = function() {
    log('hasRoot');
    return files.exists("/system/bin/su") || files.exists("/system/xbin/su");
}


/**
 * 机器人预处理 
 * 
 * 判断设备是否已经root 
 */
const robotPre_treatment = function() {
    log('robotPre_treatment');
    // 获取无障碍权限 
    if (hasRoot()) {
        // TODO　自动获取无障碍
    } else {
        auto.waitFor();
    }
    // 点亮设备， 出于安全原因 
    // TODO VincentGe 考虑等待用户解锁
    device.wakeUpIfNeeded();
}


/**
 * 修正状态
 */
const correctionStatus = function() {
    log('correctionStatus')
    if (id("ize").exists()) {
        id("ize").findOne().click();
    }
};

/**
 * 企业微信启动
 * 
 * 保持目前位于企业微信
 */
const startRobot = function() {
    log('startRobot');
    // 启动企业微信 
    if (currentPackage != 'com.tencent.wework') {
        app.launchPackage('com.tencent.wework');
        while (currentPackage() != 'com.tencent.wework') {
            sleep(500);
        }
    } else {
        toast('企業微信啓動')
    }
    // 修正企业微信状态
    correctionStatus();
};

/**
 * 准备业务
 */
const businessPreparation = function() {
    log('businessPreparation');
    sleep(100);
    // 判断是否位于工作台
    if (!className("android.widget.TextView").text("工作台").clickable(true).exists()) {
        id("f1r").className("android.widget.TextView").text("工作台").findOne().parent().click();
    }
    sleep(500);
    click("疫情防控信息采集平台");
    // 隐式等待
    className("android.widget.TextView").text("登录").findOne();
}

/**
 * 进入上报界面
 */
const login = function() {
    log('login');
    click("健康上报");
    sleep(500);
    let queren = textContains("确认").findOnce();
    if (textContains("确认").exists())
        queren.click();
    text("成功获取到位置").findOne();
    click("签到");
    if (!className("android.widget.TextView").text("填报")) {
        sleep(100);
    }
}

const fillOutTheForm = function() {
    sleep(500);
    let wendu = textContains("37.2").findOnce();
    if (!wendu.checked())
        wendu.click();
    sleep(100);
    let zhengchang = textContains("正常").findOnce();
    if (!zhengchang.checked())
        zhengchang.click();

    click("已知晓");
    let s1 = textContains("已知晓").findOnce();
    if (!s1.checked())
        s1.click();
    let s2 = textContains("已知晓").findOnce();
    if (!s2.checked())
        s2.click();
    click("无");
    // 打印所有控件数量
    log(className("android.widget.ListView").depth(7).findOne().childCount());

    // 对于控件遍历
    className("android.widget.ListView").depth(7).findOne().children().forEach(child => {
        let target = child.findOne(className("android.view.View").text("有无返校"));
        if (target) {
            log(target.parent().childCount());
            let n = target.parent().child(1).children().forEach(child => {
                let b = child.findOne(className("android.widget.RadioButton").text("有"));
                if (b) {
                    b.click();
                }
            });
            sleep(300);
            let e = target.parent().findOne(className("android.widget.EditText"));
            e.setText("已开学")
        }
    });
    let a = textContains("本人同意以上").findOnce();
    if (!a.checked())
        a.click();
    let b = textContains("上述信息是我本人填写").findOnce();
    if (!b.checked())
        b.click();
    sleep(1000);
    click("提交", 1);
    sleep(1000);
    click("确认");
};


/**
 * 机器人
 * 
 * 这个函数包含所有可执行文件
 */
const robot = function() {
    toastLog('start Robot');
    robotPre_treatment();
    startRobot();
    businessPreparation();
    login();
    fillOutTheForm();
    while (!back()) {};
};

try {
    robot();
} catch (err) {
    log(err);
}