import { Component } from "@angular/core";
import { ListGenresComponent } from "../list_genres/list-genres.component";
import { NgIf } from "@angular/common";
@Component({
    selector: 'app-test-list-genre',
    standalone: true,
    imports: [
        ListGenresComponent,
        NgIf
    ],
    templateUrl: './test-list-genres.component.html'
})
export class TestListGenreComponent {
    selectedGenreId: number | null = null;
    onGenreSelected(id: number) {
        this.selectedGenreId = id;
        console.log(`Selected Genre ID: ${id}`);
    }
}
