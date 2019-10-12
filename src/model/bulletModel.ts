import { ComponentManager, Component } from 'comMan/component';
import { EventCom } from 'comMan/eventCom';
import { config } from 'data/config';
import { BodyCom } from './com/bodyCom';
import { getShapes } from './com/bodyComUtil';
import { MoveTrackCom, TrackTarget } from './com/moveCom/moveTrackCom';
import { MoveVelocityCom } from './com/moveCom/moveVelocityCom';
import { FishModel } from './fishModel';
import { GunModel } from './gunModel';
import { ModelEvent } from './modelEvent';
import { getCollisionFish } from './modelState';
import { NetModel } from './netModel';
import { PlayerModel } from './playerModel';

export const BulletEvent = {
    Move: 'move',
    AddNet: 'add_net',
};

/** 子弹数据类 */
export class BulletModel extends ComponentManager {
    /** 等级 */
    public level: number;
    /** 等级 */
    public skin: string;
    /** 位置 */
    public pos: Point;
    /** 速度 */
    public velocity: SAT.Vector;
    private gun: GunModel;
    public player: PlayerModel;
    constructor(
        pos: Point,
        velocity: SAT.Vector,
        gun: GunModel,
        track?: TrackTarget,
    ) {
        super();

        this.level = gun.level;
        this.skin = gun.skin;
        this.pos = pos;
        this.velocity = velocity.scale(config.bullet_speed);
        this.gun = gun;
        this.player = gun.player;
        this.init(track);
    }
    public get event() {
        return this.getCom(EventCom);
    }
    public get body() {
        return this.getCom(BodyCom);
    }
    private init(track?: TrackTarget) {
        const { pos, velocity, level } = this;
        const com_list: Component[] = [new EventCom()];
        if (!track) {
            const move_com = new MoveVelocityCom(
                pos,
                velocity,
                this.onMoveChange,
            );

            const shapes = getShapes('bullet', level);
            const body_com = new BodyCom(shapes);

            com_list.push(move_com, body_com);
        } else {
            const move_com = new MoveTrackCom(
                pos,
                velocity,
                track,
                this.onTrackMoveChange,
                this.onHit,
            );

            com_list.push(move_com);
        }

        this.addCom(...com_list);
    }
    private onMoveChange = (move_info: MoveInfo) => {
        const { pos, velocity } = move_info;
        const body_com = this.body;
        body_com.update(pos, velocity);

        this.pos = pos;
        this.velocity = velocity;
        this.event.emit(BulletEvent.Move, { pos, velocity } as MoveInfo);

        const fish = getCollisionFish(body_com);
        if (fish) {
            this.onHit(fish);
        }
    }; // tslint:disable-line
    /** 追踪鱼不需要进行碰撞检测, 不需要body */
    private onTrackMoveChange = (move_info: MoveInfo) => {
        const { pos, velocity: direction } = move_info;

        this.event.emit(BulletEvent.Move, {
            pos,
            velocity: direction,
        } as MoveInfo);
    }; // tslint:disable-line
    private onHit = (track: FishModel) => {
        const net = new NetModel(this.pos, track, this);
        this.event.emit(BulletEvent.AddNet, net);
        this.destroy();
    }; // tslint:disable-line
    public destroy() {
        this.gun.removeBullet(this);
        this.event.emit(ModelEvent.Destroy);
        super.destroy();
    }
}
