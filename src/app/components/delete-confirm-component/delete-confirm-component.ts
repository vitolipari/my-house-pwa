import {Component, Input, signal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';

@Component({
  selector: 'delete-confirm-component',
  imports: [],
  templateUrl: './delete-confirm-component.html',
  styleUrl: './delete-confirm-component.css',
})

export class DeleteConfirmComponent {

    // elemento da eliminare: del componente serve solo l'id
    @Input({ required: true }) item!: { id: number | string };

    // eliminazione per id della API dell'entità (DELETE /<entità>?ids=).
    // La pagina passa una arrow function: un metodo del servizio passato così com'è perde il suo this
    @Input({ required: true }) itemApiDelete!: (ids: number[]) => Observable<unknown>;

    // cosa fare a eliminazione riuscita, di solito tornare alla lista; anche questa una arrow function della pagina
    @Input({ required: true }) exitOnDelete!: () => void;

    protected readonly isInDeleteInWaiting = signal<boolean>(false);


    // elimina l'elemento ed esce; in errore toglie l'attesa, così si può riprovare
    protected confirmDelete() {

        this.isInDeleteInWaiting.update(() => true);
        firstValueFrom(this.itemApiDelete([parseInt(''+ this.item.id)]))
            .then(() => {
                this.isInDeleteInWaiting.update(() => false);
                this.exitOnDelete();
            })
            .catch((e: any) => {
                console.log('errore in confirmDelete di DeleteConfirmComponent');
                console.log(e);
                this.isInDeleteInWaiting.update(() => false);
            })
        ;
    }
}
