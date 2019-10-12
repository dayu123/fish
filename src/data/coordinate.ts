type GunGlobalPos = { [key: string]: Point };
/** 坐标 */
export let Coordinates = {
    /** 桌面上四个炮的坐标坐标, 用来计算每一个炮的子弹的发射点 */
    gun_global_pos: {
        '0': {
            x: 404,
            y: 731,
        },
        '1': {
            x: 930, // 1334 - 404
            y: 731,
        },
        '2': {
            x: 930, // 1334 - 404
            y: 19, // 750 - 731
        },
        '3': {
            x: 404, // 1334 - 404
            y: 19,
        },
    } as GunGlobalPos,
    /** 炮的种类对应每一个炮的开始发射点, 用来计算子弹的运动的开始位置 */
    guns_inside_pos: {
        /** 枪发射的位置 */
        start_point: {
            x: 82,
            y: 50,
        },
        /** 中心点 */
        origin_point: {
            x: 82,
            y: 140,
        },
    },
    /** 炮的种类对应每一个炮的开始发射点, 用来计算子弹的运动的开始位置 */
    bullet_offset: {
        '1': [0],
        '2': [25.5, -25.5],
        '3': [36, 0, -36],
    },
    /** gun 在 gunbox 中的位置 */
    guns_inbox_pos: {
        x: 104,
        y: 78,
    },
};
