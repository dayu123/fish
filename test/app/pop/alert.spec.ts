import { Test } from 'testBuilder';
import TipPop from 'view/pop/tip';
import AlertPop from 'view/pop/alert';
import TopTipPop from 'view/pop/topTip';

export const alert_test = new Test('alert', runner => {
    runner.describe('top_tip', () => {
        TopTipPop.tip('点击屏幕内您想投放炸弹的位置');
    });
    runner.describe('show_tip', () => {
        TipPop.tip(
            'this is a test, console.log(delta, i)\nsdfsdfdsfsdf sdfdsfdsfds sdfsdfdsfds',
        );
    });
    runner.describe('show_alert', () => {
        AlertPop.alert(
            'this is a test, console.log(delta, i)\nsdfsdfdsfsdf sdfdsfdsfds sdfsdfdsfds',
        );
    });
});