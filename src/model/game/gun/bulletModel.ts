import { Component, ComponentManager } from 'comMan/component';
import { EventCom } from 'comMan/eventCom';
import { Config } from 'data/config';
import { BodyCom } from '../com/bodyCom';
import { getShapes } from '../com/bodyComUtil';
import { MoveTrackCom, TrackTarget } from '../com/moveCom/moveTrackCom';
import { MoveVelocityCom } from '../com/moveCom/moveVelocityCom';
import { FishModel } from '../fishModel';
import { ModelEvent } from '../../modelEvent';
import { getCollisionFish } from '../../modelState';
import { NetModel } from './netModel';
import { setProps } from 'utils/utils';

export const BulletEvent = {
    Move: 'move',
    AddNet: 'add_net',
};
export type CastFn = (fish: FishModel) => void;
export type BulletInfo = {
    pos: Point;
    velocity: SAT.Vector;
    bullet_cost: number;
    skin_level: string;
    skin: string;
    track?: TrackTarget;
    cast_fn?: CastFn;
};
/** 子弹数据类 */
export class BulletModel extends ComponentManager {
    /** 等级 */
    public skin_level: string;
    /** 等级 */
    public bullet_cost: number;
    /** 等级 */
    public skin: string;
    /** 位置 */
    public pos: Point;
    /** 速度 */
    public velocity: SAT.Vector;
    public cast_fn: CastFn;
    constructor(props: BulletInfo) {
        super();

        setProps(this as BulletModel, {
            ...props,
            velocity: props.velocity.scale(Config.BulletSpeed),
        });
        this.init(props.track);
    }
    public get event() {
        return this.getCom(EventCom);
    }
    public get body() {
        return this.getCom(BodyCom);
    }
    private init(track?: TrackTarget) {
        const { pos, velocity } = this;
        const com_list: Component[] = [new EventCom()];
        if (!track) {
            const move_com = new MoveVelocityCom(pos, velocity);
            move_com.onUpdate(this.onMoveChange);
            const shapes = getShapes('bullet');
            const body_com = new BodyCom(shapes);

            com_list.push(move_com, body_com);
        } else {
            const move_com = new MoveTrackCom(pos, velocity, track, this.onHit);

            com_list.push(move_com);
            move_com.onUpdate(this.onTrackMoveChange);
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
    private onHit = (fish: FishModel) => {
        const { cast_fn } = this;
        cast_fn(fish);
    }; // tslint:disable-line
    /** 创建鱼网... */
    public addNet = (show_cast: boolean) => {
        const { pos } = this;
        const net = new NetModel(
            {
                pos,
                show_cast,
            },
            this,
        );
        this.event.emit(BulletEvent.AddNet, net);
        this.destroy();
    }; // tslint:disable-line
    public destroy() {
        this.cast_fn = undefined;
        this.event.emit(ModelEvent.Destroy);
        super.destroy();
    }
}
