import { animate, state, style, transition, trigger } from '@angular/animations';

export const iconAnimation = [
    trigger('scaleIcon', [
        state('visible', style({
            transform: 'scale(1)',
        })),
        state('hidden', style({
            transform: 'scale(0)',
        })),
        transition('visible => hidden', animate('180ms ease-in-out')),
        transition('hidden => visible', animate('180ms ease-in-out'))
    ]),
];
