/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
import React from 'react';

import {
    Box,

} from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import type {
    IobTheme,
} from '@iobroker/adapter-react-v5';



type Props = {
    Name: string;
    theme: IobTheme;
};

export default function BoxDivider(props: Props): React.JSX.Element {

    return (
        <Box sx={{
            width: '100%',
            background: props.theme.palette.primary.main,
            color: props.theme.palette.primary.contrastText,
            padding: '4px !important',
            borderRadius: '3px',
            marginBlockEnd: 0,
            marginBlockStart: 0,
            marginBottom: 0
        }}>
            <h5 style={{ margin: 0 }}>
                {I18n.t(props.Name)}
            </h5>


        </Box>
    );
}