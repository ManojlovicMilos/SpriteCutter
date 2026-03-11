import { SelectInputOption, VynilUIModule } from 'vynil-ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

import { IODataStructure, SpritesetConfigType } from '../../models/io-data-structure-config.model';
import { debounce, debounceTime } from 'rxjs';

const EXPORT_TYPE_OPTIONS = [{
    text: 'Directory Structure',
    value: SpritesetConfigType.DirectoryStructure,
}, {
    text: 'Singular Image',
    value: SpritesetConfigType.SingularImage,
}];

const ANIMATION_FOLDER_NAME_STRUCTURES = [
    'animation',
    'Animation',
    'ANIMATION',
];

const DIRECTION_FOLDER_NAME_STRUCTURES = [
    'direction',
    'Direction',
    'DIRECTION',
];

const DEFAULT_FILE_NAME_STRUCTURE = {
    value: 'animation_direction_[i]',
    text: 'animation_direction_[i]',
};

const FILE_NAME_DIRECTION_STRUCTURES = [
    'direction[i]',
    'direction-[i]',
    'direction_[i]',
    'Direction[i]',
    'Direction-[i]',
    'Direction_[i]',
    'DIRECTION[i]',
    'DIRECTION-[i]',
    'DIRECTION_[i]',
];

const FILE_NAME_ANIMATION_STRUCTURES = [
    'animation[i]',
    'animation-[i]',
    'animation_[i]',
    'Animation[i]',
    'Animation-[i]',
    'Animation_[i]',
    'ANIMATION[i]',
    'ANIMATION-[i]',
    'ANIMATION_[i]',
];

const FILE_NAME_COMBINED_STRUCTURES = [
    'animationdirection[i]',
    'animation-direction-[i]',
    'animation_direction_[i]',
    'AnimationDirection[i]',
    'Animation-Direction-[i]',
    'Animation_Direction_[i]',
    'ANIMATIONDIRECTION[i]',
    'ANIMATION-DIRECTION-[i]',
    'ANIMATION_DIRECTION_[i]',
];

@Component({
    selector: 'spc-io-data-structure-editor',
    imports: [
        VynilUIModule,
        ReactiveFormsModule,
    ],
    templateUrl: './io-data-structure-editor.html',
    styleUrl: './io-data-structure-editor.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IoDataStructureEditor implements OnChanges {
    public value = input<IODataStructure>();

    public changed = output<IODataStructure>();

    public exportTypeOptions = EXPORT_TYPE_OPTIONS;
    public fileNameStructureOptionsCombined = FILE_NAME_COMBINED_STRUCTURES.map((value: string) => ({ value, text: value }));
    public fileNameStructureOptionsDirection = FILE_NAME_DIRECTION_STRUCTURES.map((value: string) => ({ value, text: value }));
    public fileNameStructureOptionsAnimation = FILE_NAME_ANIMATION_STRUCTURES.map((value: string) => ({ value, text: value }));
    public fileNameStructureOptions = [
        ...this.fileNameStructureOptionsDirection,
        ...this.fileNameStructureOptionsCombined,
    ];
    public animationFolderNameStructureOptions = ANIMATION_FOLDER_NAME_STRUCTURES.map((value: string) => ({ value, text: value }));
    public directionFolderNameStructureOptions = DIRECTION_FOLDER_NAME_STRUCTURES.map((value: string) => ({ value, text: value }));

    public expanded: boolean;
    public form: UntypedFormGroup;

    public constructor() {
        this.expanded = false;
        this.form = new UntypedFormGroup({
            type: new FormControl<SelectInputOption<string>>(EXPORT_TYPE_OPTIONS[0], { nonNullable: true }),
            animationFolders: new FormControl<boolean>(true, { nonNullable: true }),
            directionFolders: new FormControl<boolean>(false, { nonNullable: true }),
            fileNameStructure: new FormControl<SelectInputOption<string>>(DEFAULT_FILE_NAME_STRUCTURE, { nonNullable: true }),
            animationFolderNameStructure: new FormControl<SelectInputOption<string>>(this.animationFolderNameStructureOptions[0], { nonNullable: true }),
            directionFolderNameStructure: new FormControl<SelectInputOption<string>>(this.directionFolderNameStructureOptions[0], { nonNullable: true }),
        });
        this.form.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(value => this.onUpdate(this.convertFromFormValue(value)));
    }

    public ngOnChanges(): void {
        const inputValue = this.value();
        const formValue = this.convertFromFormValue(this.form.value);
        if (inputValue && !this.compareValues(inputValue, formValue)) {
            this.form.setValue({
                type: { value: inputValue.type, text: (inputValue.type === SpritesetConfigType.DirectoryStructure ? 'Directory Structure' : 'Singular Image') },
                animationFolders: inputValue.animationFolders,
                directionFolders: inputValue.directionFolders,
                fileNameStructure: { value: inputValue.fileNameStructure, text: inputValue.fileNameStructure },
                animationFolderNameStructure: { value: inputValue.animationFolderNameStructure, text: inputValue.animationFolderNameStructure },
                directionFolderNameStructure: { value: inputValue.directionFolderNameStructure, text: inputValue.directionFolderNameStructure },
            });
        }
    }

    public onToggleExpand(): void {
        this.expanded = !this.expanded;
    }

    public onUpdate(newValue: IODataStructure): void {
        const oldValue = this.value();
        if (!oldValue || !this.compareValues(newValue, oldValue)) {
            this.changed.emit(newValue);
            if (newValue.animationFolders !== oldValue?.animationFolders
                || newValue.directionFolders !== oldValue?.directionFolders) {
                    this.generateFileNameOptions(newValue);
                }
        }
    }

    private generateFileNameOptions(inputValue: IODataStructure): void {
        let newOptions: SelectInputOption<string>[] = [];
        if (inputValue.animationFolders) {
            newOptions = this.fileNameStructureOptionsDirection;
        }
        if (inputValue.directionFolders) {
            newOptions = [...newOptions, ...this.fileNameStructureOptionsAnimation];
        }
        newOptions = [...newOptions, ...this.fileNameStructureOptionsCombined];
        this.fileNameStructureOptions = newOptions;
        const currentValue = inputValue.fileNameStructure;
        // if (!newOptions.find(option => option.value === currentValue)) {
        //     this.form.setValue({
        //         ...this.form.value,
        //         fileNameStructure: DEFAULT_FILE_NAME_STRUCTURE,
        //     }, { emitEvent: false });
        // }
    }

    private convertFromFormValue(formValue: any): IODataStructure {
        return {
            type: formValue.type.value,
            animationFolders: formValue.animationFolders,
            directionFolders: formValue.directionFolders,
            fileNameStructure: formValue.fileNameStructure.value,
            animationFolderNameStructure: formValue.animationFolderNameStructure.value,
            directionFolderNameStructure: formValue.directionFolderNameStructure.value,
        };
    }

    private compareValues(value1: IODataStructure, value2: IODataStructure): boolean {
        const keys = Object.keys(value1);
        for (let key of keys) {
            if ((value1 as unknown as { [key: string]: string | boolean })[key]
                !== (value2 as unknown as { [key: string]: string | boolean })[key]) {
                return false;
            }
        }
        return true;
    }
}
