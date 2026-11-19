import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {DeviceStoreService} from './device-store';
import {DeviceType} from './devices.models';

// WebSocket finta: il test la apre, la chiude e le fa arrivare i messaggi a mano
class FakeWebSocket {
    static instances: FakeWebSocket[] = [];
    onopen: (() => void) | null = null;
    onmessage: ((msg: {data: string}) => void) | null = null;
    onclose: ((event: {code: number}) => void) | null = null;
    isClosed: boolean = false;

    constructor(public url: string) {
        FakeWebSocket.instances.push(this);
    }

    close() {
        this.isClosed = true;
    }
}

const DEVICES = [
    {id: 1, name: 'Luce', status: [0]},
    {id: 2, name: 'Presa', status: [1]}
] as unknown as DeviceType[];

// la WebSocket aperta in questo momento dal servizio
const currentChannel = (store: DeviceStoreService): FakeWebSocket => (store as any).channel;

describe('DeviceStoreService', () => {
    let store: DeviceStoreService;
    let httpMock: HttpTestingController;
    let originalWebSocket: any = (globalThis as any).WebSocket;

    beforeEach(() => {
        FakeWebSocket.instances = [];
        (globalThis as any).WebSocket = FakeWebSocket;
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        store = TestBed.inject(DeviceStoreService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        (globalThis as any).WebSocket = originalWebSocket;
        vi.useRealTimers();
    });

    it('apre la WebSocket e legge la lista dal Core una volta sola', () => {
        expect(currentChannel(store).url).toContain('/api/core/');

        let first: Promise<DeviceType[]> = store.loadDevices();
        let second: Promise<DeviceType[]> = store.loadDevices();
        httpMock.expectOne('/api/core/devices').flush(DEVICES);

        return Promise.all([first, second])
            .then(([firstList, secondList]: [DeviceType[], DeviceType[]]) => {
                expect(firstList.length).toBe(2);
                expect(secondList.length).toBe(2);
                return store.loadDevices();
            })
            .then((devices: DeviceType[]) => {
                httpMock.expectNone('/api/core/devices');
                expect(devices.length).toBe(2);
            })
            .catch((e: any) => {
                console.log('errore nel test DeviceStoreService: lettura una volta sola');
                console.log(e);
                return Promise.reject(e);
            });
    });

    it('un messaggio della WebSocket sostituisce il dispositivo e arriva alle pagine iscritte', () => {
        let received: DeviceType[] = [];
        store.deviceUpdates.subscribe((device: DeviceType) => received.push(device));

        let loading: Promise<DeviceType[]> = store.loadDevices();
        httpMock.expectOne('/api/core/devices').flush(DEVICES);

        return loading
            .then(() => {
                currentChannel(store).onmessage!({data: JSON.stringify({id: 2, name: 'Presa', status: [0]})});

                expect(store.devices()[0].status).toEqual([0]);
                expect(store.devices()[1].status).toEqual([0]);
                expect(received.map((device: DeviceType) => device.id)).toEqual([2]);
            })
            .catch((e: any) => {
                console.log('errore nel test DeviceStoreService: messaggio della WebSocket');
                console.log(e);
                return Promise.reject(e);
            });
    });

    it('dopo forgetDevices la lista si rilegge dal Core', () => {
        let first: Promise<DeviceType[]> = store.loadDevices();
        httpMock.expectOne('/api/core/devices').flush(DEVICES);

        return first
            .then(() => {
                store.forgetDevices();
                let second: Promise<DeviceType[]> = store.loadDevices();
                httpMock.expectOne('/api/core/devices').flush([...DEVICES, {id: 3, name: 'Tapparella', status: [0]}]);
                return second;
            })
            .then((devices: DeviceType[]) => {
                expect(devices.length).toBe(3);
                expect(store.devices().length).toBe(3);
            })
            .catch((e: any) => {
                console.log('errore nel test DeviceStoreService: rilettura dopo forgetDevices');
                console.log(e);
                return Promise.reject(e);
            });
    });

    it('la WebSocket chiusa si riapre dopo 5 secondi e alla riapertura la lista si rilegge', () => {
        vi.useFakeTimers();

        let loading: Promise<DeviceType[]> = store.loadDevices();
        httpMock.expectOne('/api/core/devices').flush(DEVICES);

        return loading
            .then(() => {
                let closed: FakeWebSocket = currentChannel(store);
                closed.onclose!({code: 1006});
                expect(currentChannel(store)).toBeNull();

                vi.advanceTimersByTime(4_999);
                expect(currentChannel(store)).toBeNull();
                vi.advanceTimersByTime(1);

                let reopened: FakeWebSocket = currentChannel(store);
                expect(reopened).not.toBe(closed);
                reopened.onopen!();
                httpMock.expectOne('/api/core/devices').flush(DEVICES);
            })
            .catch((e: any) => {
                console.log('errore nel test DeviceStoreService: riapertura della WebSocket');
                console.log(e);
                return Promise.reject(e);
            });
    });

    it('tornando in primo piano si apre una WebSocket nuova e la lista si rilegge', () => {
        Object.defineProperty(document, 'visibilityState', {value: 'visible', configurable: true});

        let loading: Promise<DeviceType[]> = store.loadDevices();
        httpMock.expectOne('/api/core/devices').flush(DEVICES);

        return loading
            .then(() => {
                let old: FakeWebSocket = currentChannel(store);
                document.dispatchEvent(new Event('visibilitychange'));

                let fresh: FakeWebSocket = currentChannel(store);
                expect(old.isClosed).toBe(true);
                expect(old.onclose).toBeNull();
                expect(fresh).not.toBe(old);

                fresh.onopen!();
                httpMock.expectOne('/api/core/devices').flush(DEVICES);
            })
            .catch((e: any) => {
                console.log('errore nel test DeviceStoreService: ritorno in primo piano');
                console.log(e);
                return Promise.reject(e);
            });
    });
});
