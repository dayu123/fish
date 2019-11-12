import shoal_data from '../data/shoal2.source.json';
import { displaceType } from '../shoal';

export type FishData = { pos: { x: number; y: number }; fishType: number };
export function formatType3Arr(arr: FishData[], start_x: number) {
    const sort_arr1 = arr.sort((a, b) => {
        return a.pos.x - b.pos.x;
    });

    sort_arr1.map(item => {
        item.pos.x -= start_x;
    });

    return sort_arr1;
}

export type Type3Data = {
    fish: FishData;
    startTimeRadio: number;
    endTimeRadio: number;
    params: any;
    displaceLen: number;
};
export function genType3(data: Type3Data) {
    const { fish, startTimeRadio, endTimeRadio, params, displaceLen } = data;
    const { fishType: fishId } = fish;
    const funList = [
        {
            funNo: '1',
            radio: 1,
            params,
        },
    ];
    return {
        displaceType: 'fun' as displaceType,
        fishId: fishId + '',
        startTimeRadio,
        endTimeRadio,
        displaceLen,
        funList,
    };
}
export function genType3Path(data: Type3Data) {
    const { fish, startTimeRadio, endTimeRadio, params, displaceLen } = data;
    const { fishType: fishId } = fish;
    return {
        displaceType: 'path' as displaceType,
        fishId: fishId + '',
        pathList: minusPathX1920(params),
        startTimeRadio,
        endTimeRadio,
        displaceLen,
    };
}

export function minusPathX1920(path_arr: number[][]) {
    const result = [] as number[][];
    for (const [parent_index, path_arr_item] of path_arr.entries()) {
        const result_item_arr = [] as number[];
        for (const [index, path_item] of path_arr_item.entries()) {
            if (index % 2 === 0) {
                console.log(parent_index, index, path_item);
                result_item_arr[index] = path_item - 1920;
            } else {
                result_item_arr[index] = path_item;
            }
        }
        result[parent_index] = result_item_arr;
    }
    return result;
}