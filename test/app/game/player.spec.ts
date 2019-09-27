import { state } from 'ctrl/state';
import { Test } from 'testBuilder';

export const player_test = new Test('player', runner => {
    runner.describe('add_player', () => {
        const player_data = {
            userId: 'xxxx',
            serverIndex: 1,
            level: 10,
            gold: 10000,
            gunSkin: '2',
            nickname: 'test',
            avatar: 'test',
        } as ServerPlayerInfo;
        state.game_model.addPlayer(player_data);
    });
});