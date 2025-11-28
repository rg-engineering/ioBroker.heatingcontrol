/* eslint-disable prefer-template */
/* eslint-disable quote-props */
/* eslint-disable prettier/prettier */
import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { AppBar, Tabs, Tab } from '@mui/material';

import {
    Loader,
    I18n,
    GenericApp,
    type IobTheme,
    type GenericAppProps,
    type GenericAppState,
    AdminConnection,
} from '@iobroker/adapter-react-v5';

import TabMainSettings from './Tabs/MainSettings';
import TabRoomSettings from './Tabs/RoomSettings';

import enLang from './i18n/en.json';
import deLang from './i18n/de.json';
import ruLang from './i18n/ru.json';
import ptLang from './i18n/pt.json';
import nlLang from './i18n/nl.json';
import frLang from './i18n/fr.json';
import itLang from './i18n/it.json';
import esLang from './i18n/es.json';
import plLang from './i18n/pl.json';
import ukLang from './i18n/uk.json';
import zhCnLang from './i18n/zh-cn.json';

import type { HeatingControlAdapterConfig } from "./types";

const styles: Record<string, any> = {
    tabContent: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px)',
        overflow: 'auto',
    },
    tabContentIFrame: {
        padding: 10,
        height: 'calc(100% - 64px - 48px - 20px - 38px)',
        overflow: 'auto',
    },
    selected: (theme: IobTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? undefined : '#FFF !important',
    }),
    indicator: (theme: IobTheme): React.CSSProperties => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#FFF',
    }),
};

const tabs: {
    name: string;
    title: string;
    icon?: React.JSX.Element;
    tooltip?: string;
}[] = [
        {
            name: 'main_settings',
            title: 'Main_settings',
        },
        {
            name: 'room_settings',
            title: 'Room_Settings',
        },
    ];



interface AppState extends GenericAppState {
    moreLoaded: boolean;
    rooms: Record<string, ioBroker.EnumObject> | null;
    alive: boolean;
    systemConfig: ioBroker.SystemConfigObject | null;
}

class App extends GenericApp<GenericAppProps, AppState> {
    constructor(props: GenericAppProps) {
        const extendedProps = { ...props };
        extendedProps.encryptedFields = ['pass'];

        extendedProps.translations = {
            en: enLang,
            de: deLang,
            ru: ruLang,
            pt: ptLang,
            nl: nlLang,
            fr: frLang,
            it: itLang,
            es: esLang,
            pl: plLang,
            uk: ukLang,
            'zh-cn': zhCnLang,
        };

        // @ts-expect-error tbd
        extendedProps.Connection = AdminConnection;

        extendedProps.sentryDSN = window.sentryDSN;

        super(props, extendedProps);
        this.state = {
            ...this.state,
            moreLoaded: false,
            rooms: null,
            alive: false,
            systemConfig: null,
        };
    }


    onPrepareSave(): boolean {
        console.log("onPrepareSave called " + JSON.stringify(this.state.native));

        return true;
    }

    onLoadConfig(): void {
        console.log("onLoadConfig called " + JSON.stringify(this.state.native));

        

        return;

    }

    async onConnectionReady(): Promise<void> {
        super.onConnectionReady();
        const selectedTab = window.localStorage.getItem(`ai-heatingcontrol.${this.instance}.selectedTab`) || 'connection';

        void this.socket.getEnums('rooms').then(rooms => this.setState({ moreLoaded: true, rooms }));

        const systemConfig = await this.socket.getSystemConfig();
        const aliveState = await this.socket.getState(`system.adapter.ai-heatingcontrol.${this.instance}.alive`);
        this.setState({ alive: !!aliveState?.val, selectedTab, systemConfig });
        await this.socket.subscribeState(`system.adapter.ai-heatingcontrol.${this.instance}.alive`, this.onAliveChanged);
    }

    onAliveChanged = (_id: string, state: ioBroker.State | null | undefined): void => {
        if (!!state?.val !== this.state.alive) {
            this.setState({ alive: !!state?.val });
        }
    };

    renderMainSettings(): React.JSX.Element {
        if (!this.state.systemConfig) {
            return <div>{I18n.t('Loading...')}</div>;
        }

        //console.log("renderMainSettings called");

        return (
            <TabMainSettings
                alive={this.state.alive}
                common={this.common || ({} as ioBroker.InstanceCommon)}
                socket={this.socket}
                native={this.state.native as HeatingControlAdapterConfig}
                instance={this.instance}
                adapterName={this.adapterName}
                changeNative={(native): void =>
                    this.setState({ native, changed: this.getIsChanged(native) })
                }
                themeType={this.state.themeType}
                theme={this.state.theme}
                themeName={this.state.themeName}
                systemConfig={this.state.systemConfig}
            />
        );
    }

    renderRoomSettings(): React.JSX.Element {
        if (!this.state.systemConfig) {
            return <div>{I18n.t('Loading...')}</div>;
        }

        //console.log("renderRoomSettings called");

        return (
            <TabRoomSettings
                alive={this.state.alive}
                common={this.common || ({} as ioBroker.InstanceCommon)}
                socket={this.socket}
                native={this.state.native as HeatingControlAdapterConfig}
                instance={this.instance}
                adapterName={this.adapterName}
                changeNative={(native): void =>
                    this.setState({ native, changed: this.getIsChanged(native) })
                }
                themeType={this.state.themeType}
                theme={this.state.theme}
                themeName={this.state.themeName}
                systemConfig={this.state.systemConfig}
                rooms={this.state.rooms || {}}
            />
        );
    }

   
    

    renderTab(): React.JSX.Element {

        //console.log("renderTab called");

        if (this.state.selectedTab === 'main_settings' || !this.state.selectedTab) {
            return this.renderMainSettings();
        }
        if (this.state.selectedTab === 'room_settings') {
            return this.renderRoomSettings();
        }


        //console.log("renderTab done");

        return <div>{I18n.t('Unknown tab')} {this.state.selectedTab}</div>;
    }

    render(): React.JSX.Element {

        //console.log("render called");

        if (!this.state.loaded || !this.state.moreLoaded) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader themeType={this.state.themeType} />
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <div
                        className="App"
                        style={{
                            background: this.state.theme.palette.background.default,
                            color: this.state.theme.palette.text.primary,
                        }}
                    >
                        <AppBar position="static">
                            <Tabs
                                indicatorColor="secondary"
                                value={this.state.selectedTab || tabs[0].name}
                                onChange={(_e, value) => {
                                    this.setState({ selectedTab: value });
                                    window.localStorage.setItem(`ai-heatingcontrol.${this.instance}.selectedTab`, value);
                                }}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ '&.Mui-indicator': styles.indicator }}
                            >
                                {tabs.map(tab => (
                                    <Tab
                                        value={tab.name}
                                        sx={{ '&.Mui-selected': styles.selected }}
                                        label={
                                            tab.icon ? (
                                                <>
                                                    {tab.icon}
                                                    {I18n.t(tab.title)}
                                                </>
                                            ) : (
                                                I18n.t(tab.title)
                                            )
                                        }
                                        data-name={tab.name}
                                        key={tab.name}
                                        title={tab.tooltip ? I18n.t(tab.tooltip) : undefined}
                                    />
                                ))}
                            </Tabs>
                        </AppBar>
                        <div style={this.isIFrame ? styles.tabContentIFrame : styles.tabContent}>
                            {this.renderTab()}
                        </div>
                        {this.renderError()}
                        {this.renderSaveCloseButtons()}
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export default App;
