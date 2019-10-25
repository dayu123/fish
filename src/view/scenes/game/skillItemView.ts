import { ui } from 'ui/layaMaxUI';
import { SkillMap } from 'data/config';

export const SkillNameMap = {
    [SkillMap.Freezing]: 'freeze',
    [SkillMap.Bomb]: 'bomb',
    [SkillMap.TrackFish]: 'aim',
    [SkillMap.Auto]: 'auto',
};
export default class SkillItemView extends ui.scenes.game.skillItemUI {
    private cool_mask: Laya.Sprite;
    constructor() {
        super();
        this.init();
    }
    private init() {
        const { overlay } = this;
        const cool_mask = new Laya.Sprite();
        overlay.mask = cool_mask;
        this.cool_mask = cool_mask;
    }
    public setId(skill_id: string) {
        const { skill_icon } = this;
        const name = SkillNameMap[skill_id];
        skill_icon.skin = `image/game/skill_${name}.png`;
    }
    public setNum(num: number) {
        const { num_label } = this;
        num_label.text = num + '';
    }
    /** 显示技能的冷却时间 */
    public showCoolTime(radio: number) {
        const { cool_mask, overlay } = this;
        const graphics = cool_mask.graphics;
        const radius = 60;
        const end_angle = 360 - 90;
        const angle = (1 - radio) * 360 - 90;
        graphics.clear();
        if (radio !== 0) {
            graphics.drawPie(
                40,
                41,
                radius,
                angle,
                end_angle,
                '#fff',
                '#fff',
                0,
            );
            overlay.visible = true;
        } else {
            overlay.visible = false;
            graphics.clear();
        }
    }
}