import { InteractWithConnectedMicrobit, MicrobitConnection } from '../microbit-api';
import { ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

export class ActualMicrobitConnection implements MicrobitConnection {
  constructor(port:SerialPort, config:ManagerOption){
    this.interact = new ConnectedMicrobitInteract(port, config);
    //To be added
    this.disconnection = '' as any;
  }
  interact: InteractWithConnectedMicrobit;
  disconnection: Promise<void>;
}