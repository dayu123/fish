import { FishModel } from 'model/fishModel';
import { BulletGroup } from 'model/gun/bulletGroup';
import { GunEvent, LevelInfo } from 'model/gun/gunModel';
import { PlayerModel } from 'model/playerModel';
import SAT from 'sat';
import { activeAim, stopAim } from 'view/scenes/game/ani_wrap/aim';
import GunBoxView from 'view/scenes/game/gunBoxView';
import { getPoolMousePos } from 'view/viewState';
import { BulletCtrl } from './bulletCtrl';

/** 玩家的控制器 */
export class PlayerCtrl {
    /**
     * @param view 玩家对应的动画
     * @param model 玩家对应的model
     */
    constructor(private view: GunBoxView, private model: PlayerModel) {
        this.init();
    }
    private init() {
        this.initGun();
        this.initEvent();
    }
    private initGun() {
        const { view, model } = this;
        const { server_index, gun } = model;
        const { pos } = gun;
        if (server_index > 2) {
            view.rotation = 180;
        }
        view.setPos(pos.x, pos.y);
    }
    private initEvent() {
        const {
            view,
            model: { nickname, gun, is_cur_player },
        } = this;
        const { event, direction, pos: gun_pos } = gun;
        const { ctrl_box, btn_minus, btn_add } = view;

        event.on(
            GunEvent.AddBullet,
            (bullet_group: BulletGroup, velocity: SAT.Vector) => {
                const { rage } = gun;
                view.fire(velocity, nickname);
                view.stopPosTip();
                for (const bullet of bullet_group.bullet_list) {
                    const bullet_view = view.addBullet(
                        bullet.skin,
                        rage,
                    ) as Laya.Skeleton;
                    const bullet_ctrl = new BulletCtrl(bullet_view, bullet);
                }
            },
        );

        view.setDirection(direction);
        event.on(GunEvent.DirectionChange, (_direction: SAT.Vector) => {
            view.setDirection(_direction);
        });
        event.on(GunEvent.LevelChange, (level_info: LevelInfo) => {
            view.setLevel(level_info);
        });

        /** 当前用户的处理 */
        if (!is_cur_player) {
            return;
        }
        event.on(GunEvent.CastFish, (fish: FishModel) => {
            console.log(`cast fish:`, fish);
        });
        event.on(
            GunEvent.StartTrack,
            (fish: FishModel, show_point: boolean) => {
                activeAim(fish, show_point, gun.pos);
            },
        );
        event.on(GunEvent.StopTrack, () => {
            stopAim();
        });
        Laya.stage.on(Laya.Event.CLICK, view, (e: Laya.Event) => {
            const click_pos = getPoolMousePos();
            const _direction = new SAT.Vector(
                click_pos.x - gun_pos.x,
                click_pos.y - gun_pos.y,
            );
            gun.preAddBullet(_direction);
        });

        ctrl_box.visible = true;
        btn_minus.on(Laya.Event.CLICK, btn_minus, () => {
            console.log(`btn_minus`);
        });
        btn_add.on(Laya.Event.CLICK, btn_minus, () => {
            console.log(`btn_add`);
        });
    }
}
