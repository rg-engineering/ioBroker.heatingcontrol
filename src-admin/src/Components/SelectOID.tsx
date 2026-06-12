/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */

import {  FormControl, Button, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { DialogSelectID } from '@iobroker/adapter-react-v5';
import type {
    AdminConnection,
    IobTheme,
    ThemeName,
    ThemeType,
    ObjectBrowserCustomFilter,
    ObjectBrowserType
} from '@iobroker/adapter-react-v5';

export type SelectOIDItem = { name: string; value: string; };

type Props = {
    settingName: string;
    
    Value: string;
    socket: AdminConnection;
    theme: IobTheme;
    themeName: ThemeName;
    themeType: ThemeType;
    onChange: ( value: string) => void;
    addButtonTooltip?: string;
};

const styles: Record<string, React.CSSProperties> = {
    flex: {
        display: 'flex',
    },
    button: {
        height: 48,
        marginLeft: 4,
        minWidth: 48,
    },
};

export default function SelectOID(props: Props): React.JSX.Element {
    // Lokaler State für das Anzeigen des ObjectBrowser-Dialogs
    const [showSelectId, setShowSelectId] = useState<boolean>(false);

    // Neuer lokaler State für das TextField-Wert (initialisiert aus props.Value)
    const [value, setValue] = useState<string>(props.Value || '');

    // Synchronisiere lokalen Wert, wenn parent-prop sich ändert
    useEffect(() => {
        setValue(props.Value || '');
    }, [props.Value]);


    const error = "";
    const disabled = false;

    const socket = props.socket;

    const customFilter: ObjectBrowserCustomFilter = { type: ["channel", "state", "device"] };
    const root = "";
    const types: ObjectBrowserType = ["channel", "state", "device"] ;

    return (
        <FormControl fullWidth variant="standard">

            <div style={styles.flex} >
                <TextField
                    variant="standard"
                    fullWidth
                    value={value}
                    error={!!error}
                    disabled={disabled}
                    placeholder={props.settingName}
                    
                   
                    onChange={e => {
                        const value_ = e.target.value;
                        console.log("new value" + value_);
                        setValue(value_);
                        // Parent informieren
                        props.onChange(value_);


                    }}
                />
                <Button
                    color="grey"
                    disabled={disabled}
                    style={styles.button}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        console.log("on click ");
                        setShowSelectId(true);
                    }}
                >
                    ...
                </Button>

                {showSelectId ? (
                    <DialogSelectID
                        imagePrefix={
                            '../..'
                        }
                        dialogName="DialogName to do"

                        themeType={props.themeType}
                        theme={props.theme}
                        types={types}
                        customFilter={customFilter}

                        socket={socket}
                        selected={props.Value}
                        root={root}
                        onClose={() => {
                            console.log("on close");
                            setShowSelectId(false);
                        }}
                        onOk={value_ => {
                            console.log("on okay, new value ");
                            setShowSelectId(false);
                            // Typabsicherung: value_ kann string | string[] | undefined sein.
                            // Konvertiere in einen string, bevor setValue aufgerufen wird.
                            const normalized: string = typeof value_ === 'string'
                                ? value_
                                : Array.isArray(value_)
                                    ? value_.join(',')
                                    : '';

                            setValue(normalized);
                            // Parent informieren
                            props.onChange(normalized);

                        }}
                    />
                ) : (
                    null
                )}
            </div>
        </FormControl>
    );
}