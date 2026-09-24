import {Component, Input} from '@angular/core';
import {ZoneType} from '../../pages/devices/devices.models';

@Component({
    selector: 'room-list-block',
    imports: [],
    templateUrl: './room-list-block.component.html',
    styleUrls: [
        './room-list-block.component.css'
        , '../device-ip-block.component/device-ip-block.component.css'
    ],
    standalone: true
})
export class RoomListBlockComponent {

    @Input() room!: ZoneType;
    roomIcon: string = 'Door02'; // 'BxsDoorOpen'; // 'Door02';

    get displayName(): string {
        return this.room.name;
    }

    get deviceCount(): string {
        console.log('stanza in lista');
        console.log( this.room );
        // console.log( this.room.device_list.split(',') );
        // console.log( this.room.device_list.split(',').length );
        return `${ this.room.device_list.split(',').filter((part: string) => !!part).length } dispositivi`;
    }

}
