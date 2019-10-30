import HallView from 'view/scenes/hallView';
import ShopPop from 'view/pop/shop';
import { modelState } from 'model/modelState';
import { SettingEvent } from 'model/userInfo/settingModel';
import { Lang } from 'data/internationalConfig';
import { UserInfoEvent } from 'model/userInfo/userInfoModel';
import {
    offBindEvent,
    onCurCoinChange,
    onLangChange,
    onAccountChange,
    onNicknameChange,
    getAllLangList,
} from './hallCtrlUtil';

export class HallCtrl {
    private view: HallView;
    constructor(view: HallView) {
        this.view = view;
        this.init();
    }
    public static async preEnter() {
        const view = (await HallView.preEnter()) as HallView;
        const ctrl = new HallCtrl(view);
    }
    private init() {
        this.initViewEvent();
        this.initModelEvent();
    }
    private initModelEvent() {
        const { view } = this;
        const { user_info } = modelState.app;

        onCurCoinChange(this, coin => {
            const { account_map } = user_info;
            const num = account_map.get(coin);
            view.setCoin(coin, num);
        });
        onLangChange(this, (lang: Lang) => {
            view.setFlag(lang);
        });
        onAccountChange(this, (data: Map<string, number>) => {
            view.setCoinData(data);
        });
        onNicknameChange(this, (nickname: string) => {
            view.setNickname(nickname);
        });
        view.setFlagData(getAllLangList());
    }
    private initViewEvent() {
        const { view } = this;
        const { normal_box, match_box, header, btn_play_now } = view;
        const {
            coin_menu: { list: coin_menu_list },
            flag_menu: { list: flag_menu_list },
        } = header;

        const {
            btn_coin_select,
            btn_get,
            btn_charge,
            btn_buy,
            btn_home,
            btn_app,
            btn_leave,
            btn_voice,
            flag_box,
        } = header;

        coin_menu_list.selectHandler = new Laya.Handler(
            coin_menu_list,
            this.selectCoin,
            undefined,
            false,
        );
        flag_menu_list.selectHandler = new Laya.Handler(
            coin_menu_list,
            this.selectFlag,
            undefined,
            false,
        );

        const { CLICK } = Laya.Event;
        const btn_normal_try = normal_box.getChildByName('btn_try');
        const btn_normal_play = normal_box.getChildByName('btn_play');
        const btn_match_try = match_box.getChildByName('btn_try');
        const btn_match_play = match_box.getChildByName('btn_play');
        btn_normal_try.on(CLICK, this, () => {
            console.log(`btn_normal_try`);
        });
        btn_normal_play.on(CLICK, this, () => {
            console.log(`btn_normal_play`);
        });
        btn_match_try.on(CLICK, this, () => {
            console.log(`btn_match_try`);
        });
        btn_coin_select.on(CLICK, this, () => {
            view.toggleCoinMenu();
        });
        btn_get.on(CLICK, this, () => {
            console.log(`btn_get`);
        });
        btn_charge.on(CLICK, this, () => {
            console.log(`btn_charge`);
        });
        btn_buy.on(CLICK, this, () => {
            ShopPop.preEnter();
        });
        btn_home.on(CLICK, this, () => {
            console.log(`btn_home`);
        });
        btn_app.on(CLICK, this, () => {
            console.log(`btn_app`);
        });
        btn_home.on(CLICK, this, () => {
            console.log(`btn_home`);
        });
        btn_leave.on(CLICK, this, () => {
            console.log(`btn_leave`);
        });
        btn_voice.on(CLICK, this, () => {
            console.log(`btn_voice`);
        });
        flag_box.on(CLICK, this, () => {
            view.toggleFlagMenu();
        });
        btn_play_now.on(CLICK, this, () => {
            console.log(`btn_play_now`);
        });
    }
    private selectCoin = (index: number) => {
        if (index === -1) {
            return;
        }
        const { view } = this;
        const {
            coin_menu: { list },
        } = view.header;
        const { setting } = modelState.app;
        const coin_type = list.array[index].coin_name;
        setting.setCurCoin(coin_type);
        view.toggleCoinMenu();
    }; // tslint:disable-line
    private selectFlag = (index: number) => {
        if (index === -1) {
            return;
        }
        const { view } = this;
        const {
            flag_menu: { list },
        } = view.header;
        const { setting } = modelState.app;
        const flag_type = list.array[index].flag_type;

        setting.setLang(flag_type);
        view.toggleFlagMenu();
    }; // tslint:disable-line
    public destroy() {
        offBindEvent(this);
    }
}
