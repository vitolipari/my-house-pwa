import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {Accordion, AccordionContent, AccordionHeader, AccordionModule, AccordionPanel} from 'primeng/accordion';

import {DeviceApiService} from '../devices/device-api';
import {emoj} from '../../utils/string-utils';
import {RadioButton, RadioButtonModule} from 'primeng/radiobutton';
import {getLastElementOr} from '../../utils/array-util';
import {
    CommissioningJob,
    DeviceCatalogItem,
    DeviceCategory,
    DeviceTaxonomy,
    DeviceTipology,
    DeviceType,
    DeviceTypeDefinition,
    MeteredSwitchType,
    ShellyFamilyType,
    SwitchType,
    TuyaFamilyType,
    VOID_DEVICE,
    VOID_DEVICE_FAMILY,
    VOID_METRED_SWITCH,
    VOID_SHELLY_FAMILY,
    VOID_SWITCH,
    VOID_TEMPERATURE_HUMIDITY_SENSOR, VOID_TUYA_FAMILY,
    ZoneType
} from '../devices/devices.models';
import {Listbox, ListboxModule} from 'primeng/listbox';
import {
    DeviceIpBlockComponent,
    NetworkIdentity
} from '../../components/device-ip-block.component/device-ip-block.component';
import {ApiUrlService} from '../../services/api-url-service';
import {InputText, InputTextModule} from 'primeng/inputtext';
import {Button, ButtonModule} from 'primeng/button';
import {RoomListBlockComponent} from '../../components/room-list-block.component/room-list-block.component';
import {Router} from '@angular/router';


/*

taxonomy =
                                    {
                                      "categories": [
                                        {
                                          "id": "ACTUATOR",
                                          "name": "Attuatore",
                                          "description": "Riceve comandi e modifica lo stato del dispositivo o dell ambiente"
                                        },
                                        {
                                          "id": "SENSOR",
                                          "name": "Sensore",
                                          "description": "Produce misure o eventi osservati senza comandi funzionali"
                                        },
                                        {
                                          "id": "SENSOR_ACTUATOR",
                                          "name": "Sensore e attuatore",
                                          "description": "Produce misure e riceve comandi funzionali"
                                        }
                                      ],
                                      "types": [
                                        {
                                          "id": "CAR",
                                          "name": "Automobile",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria del veicolo e comandi remoti supportati"
                                        },
                                        {
                                          "id": "ELECTRIC_CAR",
                                          "name": "Automobile elettrica",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria del veicolo e della batteria con gestione dei comandi e della ricarica"
                                        },
                                        {
                                          "id": "ELECTRIC_BICYCLE",
                                          "name": "Bicicletta elettrica",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria, stato della batteria e comandi remoti supportati"
                                        },
                                        {
                                          "id": "GATE",
                                          "name": "Cancello",
                                          "category": "ACTUATOR",
                                          "description": "Comando di apertura e chiusura con feedback dello stato operativo"
                                        },
                                        {
                                          "id": "SPEAKER",
                                          "name": "Cassa audio",
                                          "category": "ACTUATOR",
                                          "description": "Riproduzione audio e controllo del volume con feedback operativo"
                                        },
                                        {
                                          "id": "AIR_CONDITIONER",
                                          "name": "Climatizzatore",
                                          "category": "ACTUATOR",
                                          "description": "Controllo di modalita, setpoint, ventola e flussi"
                                        },
                                        {
                                          "id": "SENSING_AIR_CONDITIONER",
                                          "name": "Climatizzatore con sensori ambiente",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Controllo del climatizzatore e misure ambientali"
                                        },
                                        {
                                          "id": "GAME_CONSOLE",
                                          "name": "Console da gioco",
                                          "category": "ACTUATOR",
                                          "description": "Controllo diretto della console con feedback di stato operativo"
                                        },
                                        {
                                          "id": "ENERGY_METER",
                                          "name": "Contatore energetico",
                                          "category": "SENSOR",
                                          "description": "Misura di potenza ed energia senza comando funzionale"
                                        },
                                        {
                                          "id": "HEADPHONES",
                                          "name": "Cuffie",
                                          "category": "ACTUATOR",
                                          "description": "Riproduzione audio e controllo del volume con feedback operativo"
                                        },
                                        {
                                          "id": "DIMMER",
                                          "name": "Dimmer",
                                          "category": "ACTUATOR",
                                          "description": "Regolazione del livello senza misure sensoriali"
                                        },
                                        {
                                          "id": "COLOR_DIMMER",
                                          "name": "Dimmer a colori",
                                          "category": "ACTUATOR",
                                          "description": "Accensione, regolazione della luminosita e controllo del colore"
                                        },
                                        {
                                          "id": "METERED_DIMMER",
                                          "name": "Dimmer con misura",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Regolazione del livello e misura della potenza o energia"
                                        },
                                        {
                                          "id": "SWITCH",
                                          "name": "Interruttore ON/OFF",
                                          "category": "ACTUATOR",
                                          "description": "Comando ON/OFF senza misure sensoriali"
                                        },
                                        {
                                          "id": "METERED_SWITCH",
                                          "name": "Interruttore ON/OFF con misura",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Comando ON/OFF e misura della potenza o energia"
                                        },
                                        {
                                          "id": "POWER_METER",
                                          "name": "Misuratore di potenza",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Misura della potenza o energia con comando ON/OFF"
                                        },
                                        {
                                          "id": "SOLAR_SYSTEM_MONITOR",
                                          "name": "Monitor impianto fotovoltaico",
                                          "category": "SENSOR",
                                          "description": "Monitoraggio della produzione e dei parametri del sistema fotovoltaico senza comandi"
                                        },
                                        {
                                          "id": "ELECTRIC_SCOOTER",
                                          "name": "Monopattino elettrico",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria, stato della batteria e comandi remoti supportati"
                                        },
                                        {
                                          "id": "MOTORCYCLE",
                                          "name": "Motocicletta",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria del veicolo e comandi remoti supportati"
                                        },
                                        {
                                          "id": "DOOR",
                                          "name": "Porta",
                                          "category": "ACTUATOR",
                                          "description": "Comando di apertura e chiusura con feedback dello stato operativo"
                                        },
                                        {
                                          "id": "FIRE_SENSOR",
                                          "name": "Sensore antincendio",
                                          "category": "SENSOR",
                                          "description": "Rilevazione di fumo, calore o condizioni compatibili con un incendio"
                                        },
                                        {
                                          "id": "WATER_LEVEL_SENSOR",
                                          "name": "Sensore di livello dell'acqua",
                                          "category": "SENSOR",
                                          "description": "Misura il livello dell'acqua in serbatoi o cisterne"
                                        },
                                        {
                                          "id": "LIGHT_SENSOR",
                                          "name": "Sensore di luminosita",
                                          "category": "SENSOR",
                                          "description": "Misura dell intensita luminosa"
                                        },
                                        {
                                          "id": "LIGHT_SENSOR_SWITCH",
                                          "name": "Sensore di luminosita con comando",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Misura della luminosita e comando ON/OFF"
                                        },
                                        {
                                          "id": "MOVEMENT_SENSOR",
                                          "name": "Sensore di movimento",
                                          "category": "SENSOR",
                                          "description": "Rilevazione di movimento o presenza"
                                        },
                                        {
                                          "id": "MOVEMENT_SENSOR_SWITCH",
                                          "name": "Sensore di movimento con comando",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Rilevazione di movimento e comando ON/OFF"
                                        },
                                        {
                                          "id": "TEMPERATURE_HUMIDITY_SENSOR",
                                          "name": "Sensore di temperatura e umidita",
                                          "category": "SENSOR",
                                          "description": "Misura di temperatura e umidita ambiente"
                                        },
                                        {
                                          "id": "TV",
                                          "name": "Smart TV",
                                          "category": "ACTUATOR",
                                          "description": "Controllo diretto con feedback di stato operativo"
                                        },
                                        {
                                          "id": "SMART_WATCH",
                                          "name": "Smartwatch",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Telemetria personale e gestione di notifiche, avvisi o comandi supportati"
                                        },
                                        {
                                          "id": "PRINTER",
                                          "name": "Stampante",
                                          "category": "ACTUATOR",
                                          "description": "Invio e gestione dei lavori di stampa con feedback operativo"
                                        },
                                        {
                                          "id": "THREE_D_PRINTER",
                                          "name": "Stampante 3D",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Gestione della stampa e misura dei parametri fisici del processo"
                                        },
                                        {
                                          "id": "GPS_TAG",
                                          "name": "Tag GPS",
                                          "category": "SENSOR",
                                          "description": "Rilevazione della posizione e telemetria del localizzatore senza comando funzionale"
                                        },
                                        {
                                          "id": "CURTAIN",
                                          "name": "Tapparella",
                                          "category": "ACTUATOR",
                                          "description": "Controllo interbloccato di apertura, chiusura e posizione"
                                        },
                                        {
                                          "id": "METERED_CURTAIN",
                                          "name": "Tapparella con misura",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Controllo tapparella e misura della potenza o energia"
                                        },
                                        {
                                          "id": "THERMOSTAT",
                                          "name": "Termostato",
                                          "category": "SENSOR_ACTUATOR",
                                          "description": "Misura della temperatura e controllo di modalita e setpoint"
                                        },
                                        {
                                          "id": "MOTORIZED_CANOPY",
                                          "name": "Tettoia motorizzata",
                                          "category": "ACTUATOR",
                                          "description": "Controllo di apertura, chiusura e posizione della copertura motorizzata"
                                        },
                                        {
                                          "id": "MOTORIZED_DYNAMIC_CANOPY",
                                          "name": "Tettoia motorizzata orientabile",
                                          "category": "ACTUATOR",
                                          "description": "Controllo di apertura, chiusura, posizione e inclinazione percentuale delle barre da 0% a 100%"
                                        }
                                      ],
                                      "usages": [
                                        {
                                          "id": "IRRIGATION",
                                          "name": "Irrigazione",
                                          "description": "Impianto di irrigazione comandato"
                                        },
                                        {
                                          "id": "LAMP",
                                          "name": "Lampada",
                                          "description": "Carico per illuminazione"
                                        },
                                        {
                                          "id": "PUMP",
                                          "name": "Pompa",
                                          "description": "Pompa comandata"
                                        },
                                        {
                                          "id": "SOCKET",
                                          "name": "Presa elettrica",
                                          "description": "Presa elettrica comandata"
                                        },
                                        {
                                          "id": "LED_STRIP",
                                          "name": "Striscia LED",
                                          "description": "Striscia LED comandata"
                                        },
                                        {
                                          "id": "VALVE",
                                          "name": "Valvola",
                                          "description": "Valvola o rubinetto comandato"
                                        },
                                        {
                                          "id": "FAN",
                                          "name": "Ventola",
                                          "description": "Ventola o sistema di ventilazione comandato"
                                        }
                                      ]
                                    }

                                    catalog =
                                    [
                                      {
                                        "id": "LAMP",
                                        "name": "Lampada",
                                        "svgIcon": "icon-325",
                                        "emojIcon": "light_bulb",
                                        "imgIcon": null,
                                        "description": "Carico per illuminazione",
                                        "source": "USAGE",
                                        "usage": "LAMP",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH",
                                          "DIMMER",
                                          "METERED_DIMMER",
                                          "COLOR_DIMMER",
                                          "POWER_METER"
                                        ]
                                      },
                                      {
                                        "id": "LED_STRIP",
                                        "name": "Striscia LED",
                                        "svgIcon": "icon-66",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Striscia LED comandata",
                                        "source": "USAGE",
                                        "usage": "LED_STRIP",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH",
                                          "DIMMER",
                                          "METERED_DIMMER",
                                          "COLOR_DIMMER"
                                        ]
                                      },
                                      {
                                        "id": "SOCKET",
                                        "name": "Presa elettrica",
                                        "svgIcon": "icon-272",
                                        "emojIcon": "high_voltage",
                                        "imgIcon": null,
                                        "description": "Presa elettrica comandata",
                                        "source": "USAGE",
                                        "usage": "SOCKET",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH",
                                          "POWER_METER"
                                        ]
                                      },
                                      {
                                        "id": "FAN",
                                        "name": "Ventola",
                                        "svgIcon": "Icon-490",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Ventola o sistema di ventilazione comandato",
                                        "source": "USAGE",
                                        "usage": "FAN",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "VALVE",
                                        "name": "Valvola",
                                        "svgIcon": "Icon-566",
                                        "emojIcon": "potable_water",
                                        "imgIcon": null,
                                        "description": "Valvola o rubinetto comandato",
                                        "source": "USAGE",
                                        "usage": "VALVE",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "PUMP",
                                        "name": "Pompa",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Pompa comandata",
                                        "source": "USAGE",
                                        "usage": "PUMP",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "IRRIGATION",
                                        "name": "Irrigazione",
                                        "svgIcon": "icon-602",
                                        "emojIcon": "seedling",
                                        "imgIcon": null,
                                        "description": "Impianto di irrigazione comandato",
                                        "source": "USAGE",
                                        "usage": "IRRIGATION",
                                        "compatibleTypes": [
                                          "SWITCH",
                                          "METERED_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "CURTAIN",
                                        "name": "Tapparella",
                                        "svgIcon": "icon-602",
                                        "emojIcon": "window",
                                        "imgIcon": null,
                                        "description": "Controllo interbloccato di apertura, chiusura e posizione",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "CURTAIN",
                                          "METERED_CURTAIN"
                                        ]
                                      },
                                      {
                                        "id": "MOTORIZED_CANOPY",
                                        "name": "Tettoia motorizzata",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Controllo di apertura, chiusura e posizione della copertura motorizzata",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "MOTORIZED_CANOPY",
                                          "MOTORIZED_DYNAMIC_CANOPY"
                                        ]
                                      },
                                      {
                                        "id": "GATE",
                                        "name": "Cancello",
                                        "svgIcon": "icon-602",
                                        "emojIcon": "shinto_shrine",
                                        "imgIcon": null,
                                        "description": "Comando di apertura e chiusura con feedback dello stato operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "GATE"
                                        ]
                                      },
                                      {
                                        "id": "DOOR",
                                        "name": "Porta",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Comando di apertura e chiusura con feedback dello stato operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "DOOR"
                                        ]
                                      },
                                      {
                                        "id": "TV",
                                        "name": "Smart TV",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Controllo diretto con feedback di stato operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "TV"
                                        ]
                                      },
                                      {
                                        "id": "AIR_CONDITIONER",
                                        "name": "Climatizzatore",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Controllo di modalita, setpoint, ventola e flussi",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "AIR_CONDITIONER",
                                          "SENSING_AIR_CONDITIONER"
                                        ]
                                      },
                                      {
                                        "id": "THERMOSTAT",
                                        "name": "Termostato",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Misura della temperatura e controllo di modalita e setpoint",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "THERMOSTAT"
                                        ]
                                      },
                                      {
                                        "id": "HEADPHONES",
                                        "name": "Cuffie",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Riproduzione audio e controllo del volume con feedback operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "HEADPHONES"
                                        ]
                                      },
                                      {
                                        "id": "SPEAKER",
                                        "name": "Cassa audio",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Riproduzione audio e controllo del volume con feedback operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "SPEAKER"
                                        ]
                                      },
                                      {
                                        "id": "GAME_CONSOLE",
                                        "name": "Console da gioco",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Controllo diretto della console con feedback di stato operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "GAME_CONSOLE"
                                        ]
                                      },
                                      {
                                        "id": "PRINTER",
                                        "name": "Stampante",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Invio e gestione dei lavori di stampa con feedback operativo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "PRINTER"
                                        ]
                                      },
                                      {
                                        "id": "THREE_D_PRINTER",
                                        "name": "Stampante 3D",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Gestione della stampa e misura dei parametri fisici del processo",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "THREE_D_PRINTER"
                                        ]
                                      },
                                      {
                                        "id": "MOVEMENT_SENSOR",
                                        "name": "Sensore di movimento",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Rilevazione di movimento o presenza",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "MOVEMENT_SENSOR",
                                          "MOVEMENT_SENSOR_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "TEMPERATURE_HUMIDITY_SENSOR",
                                        "name": "Sensore di temperatura e umidita",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Misura di temperatura e umidita ambiente",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "TEMPERATURE_HUMIDITY_SENSOR"
                                        ]
                                      },
                                      {
                                        "id": "LIGHT_SENSOR",
                                        "name": "Sensore di luminosita",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Misura dell intensita luminosa",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "LIGHT_SENSOR",
                                          "LIGHT_SENSOR_SWITCH"
                                        ]
                                      },
                                      {
                                        "id": "WATER_LEVEL_SENSOR",
                                        "name": "Sensore di livello dell'acqua",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Misura il livello dell'acqua in serbatoi o cisterne",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "WATER_LEVEL_SENSOR"
                                        ]
                                      },
                                      {
                                        "id": "FIRE_SENSOR",
                                        "name": "Sensore antincendio",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Rilevazione di fumo, calore o condizioni compatibili con un incendio",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "FIRE_SENSOR"
                                        ]
                                      },
                                      {
                                        "id": "ENERGY_METER",
                                        "name": "Contatore energetico",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Misura di potenza ed energia senza comando funzionale",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "ENERGY_METER",
                                          "POWER_METER"
                                        ]
                                      },
                                      {
                                        "id": "SOLAR_SYSTEM_MONITOR",
                                        "name": "Monitor impianto fotovoltaico",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Monitoraggio della produzione e dei parametri del sistema fotovoltaico senza comandi",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "SOLAR_SYSTEM_MONITOR"
                                        ]
                                      },
                                      {
                                        "id": "CAR",
                                        "name": "Automobile",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria del veicolo e comandi remoti supportati",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "CAR"
                                        ]
                                      },
                                      {
                                        "id": "ELECTRIC_CAR",
                                        "name": "Automobile elettrica",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria del veicolo e della batteria con gestione dei comandi e della ricarica",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "ELECTRIC_CAR"
                                        ]
                                      },
                                      {
                                        "id": "MOTORCYCLE",
                                        "name": "Motocicletta",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria del veicolo e comandi remoti supportati",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "MOTORCYCLE"
                                        ]
                                      },
                                      {
                                        "id": "ELECTRIC_SCOOTER",
                                        "name": "Monopattino elettrico",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria, stato della batteria e comandi remoti supportati",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "ELECTRIC_SCOOTER"
                                        ]
                                      },
                                      {
                                        "id": "ELECTRIC_BICYCLE",
                                        "name": "Bicicletta elettrica",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria, stato della batteria e comandi remoti supportati",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "ELECTRIC_BICYCLE"
                                        ]
                                      },
                                      {
                                        "id": "GPS_TAG",
                                        "name": "Tag GPS",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Rilevazione della posizione e telemetria del localizzatore senza comando funzionale",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "GPS_TAG"
                                        ]
                                      },
                                      {
                                        "id": "SMART_WATCH",
                                        "name": "Smartwatch",
                                        "svgIcon": "icon-602",
                                        "emojIcon": null,
                                        "imgIcon": null,
                                        "description": "Telemetria personale e gestione di notifiche, avvisi o comandi supportati",
                                        "source": "TYPE",
                                        "usage": null,
                                        "compatibleTypes": [
                                          "SMART_WATCH"
                                        ]
                                      }
                                    ]

 */





@Component({
    selector: 'app-new-device.page',
    imports: [
        CommonModule,
        FormsModule,
        PageTitleComponent,
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        RadioButton,
        DeviceIpBlockComponent,
        Listbox,
        InputText,
        ReactiveFormsModule,
        Button,
        RoomListBlockComponent
    ],
    templateUrl: './new-device.page.html',
    styleUrls: [
        // '../../components/page-title.component/page-title.component.css',
        '../sign-in/signin.page.css'
        , '../sign-up/signup.page.css'
        , './new-device.page.css'
    ],
    standalone: true
})
export class NewDevicePage implements OnInit {


    activeAccordionValue: string | number | string[] | number[] | null | undefined = 'init';
    currentStep: number = 0;
    deviceKnowledgeType: string = '';
    integration: string = '';
    // selectedType: any;
    selectedFunctionalType: string = '';
    selectedFunctionalTypeObj: any = {name: '', description: ''};
    selectedUsage: string = '';
    selectedCatalogItemId: string = '';
    sections: any = {
        init:           {value: 'init',             label: 'Accoppiamento',         step: 0},
        family:         {value: 'family',           label: 'Famiglia Dispositivi',  step: 1},
        type:           {value: 'type',             label: 'Tipologia',             step: 2},
        feature:        {value: 'feature',          label: 'Features',              step: 3},
        discovery:      {value: 'discovery',        label: 'Discovery & Selection', step: 4},
        commissioning:  {value: 'commissioning',    label: 'Pair',                  step: 5},
        room:           {value: 'room',             label: 'Posizione',             step: 6},
        naming:         {value: 'naming',           label: 'Nomi',                  step: 7},
        confirm:         {value: 'confirm',           label: 'Fine',                  step: 8}
    };

    readonly isInScanning = signal(true);
    ipDevices: NetworkIdentity[] = [];

    readonly devices = signal<NetworkIdentity[]>([]);
    readonly devicesLoading = signal(true);
    selectedIpDevice!: NetworkIdentity;
    readonly devicesError = signal<string | null>(null);
    readonly catalog = signal<DeviceCatalogItem[]>([]);
    readonly taxonomy = signal<DeviceTaxonomy>({categories: [], types: [], usages: []});
    readonly taxonomyLoading = signal(true);
    readonly taxonomyError = signal<string | null>(null);
    readonly newDevice = signal<DeviceType>(VOID_DEVICE);
    readonly newDeviceDataTreePanelOpen = signal<boolean>(false);
    readonly isCopied = signal<boolean>(false);
    readonly inWaiting = signal<boolean>(false);
    readonly rooms = signal<ZoneType[]>([]);
    readonly isRoomsInWaiting = signal<boolean>(false);
    selectedRoom!: ZoneType;


    private readonly fb = inject(FormBuilder);
    private readonly deviceApi = inject(DeviceApiService);
    private readonly api = inject<ApiUrlService>(ApiUrlService);
    private router = inject(Router);


    readonly deviceForm = this.fb.nonNullable.group({
        deviceName: ['', [Validators.required]],
        deviceIp: ['', [Validators.required]]
    });

    // deviceForm = new FormGroup({
    //     deviceName: new FormControl(),
    //     deviceIp: new FormControl()
    // });

    @ViewChild("newDeviceCard", {static: true, read: ElementRef}) newDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("newDeviceIcon", {static: true, read: ElementRef}) newDeviceIcon!: ElementRef<SVGElement>;
    @ViewChild("knownDevice", {static: true, read: ElementRef}) knownDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("knownDeviceIcon", {static: true, read: ElementRef}) knownDeviceIcon!: ElementRef<SVGElement>;
    @ViewChild("deviceName", {static: true, read: ElementRef}) deviceName!: ElementRef<HTMLInputElement>;
    @ViewChild("deviceTuyaMac", {static: false, read: ElementRef}) deviceTuyaMac!: ElementRef<HTMLInputElement>;
    @ViewChild("deviceTuyaVirtualID", {static: false, read: ElementRef}) deviceTuyaVirtualID!: ElementRef<HTMLInputElement>;
    @ViewChild("matterPairingCode", {static: false, read: ElementRef}) matterPairingCode!: ElementRef<HTMLInputElement>;

    // commissioning Matter: errore da mostrare e tipo proposto dal Core in base ai cluster del nodo
    readonly matterError = signal<string | null>(null);
    readonly matterDetectedType = signal<string | null>(null);

    ngOnInit() {

        try {
            Promise.all([
                firstValueFrom(this.deviceApi.taxonomy()),
                firstValueFrom(this.deviceApi.catalog())
            ])
                .then(([taxonomy, catalog]) => {
                    console.log('response di taxonomy');
                    console.log(taxonomy);

                    console.log('response di catalog');
                    console.log(catalog);


                    this.taxonomy.set(taxonomy);
                    this.catalog.set(catalog);
                    this.taxonomyLoading.set(false);


                })
                .catch((e: any) => {
                    console.log('errore in ngOnInit');
                    console.log(e);

                    // l'errore arriva in modo asincrono: il try/catch esterno non
                    // lo vede, quindi messaggio e attesa si chiudono qui
                    const candidate = e as {error?: {error?: string}; message?: string};
                    this.taxonomyError.set(
                        candidate.error?.error ?? candidate.message ?? 'Impossibile caricare tipi e categorie'
                    );
                    this.taxonomyLoading.set(false);
                })
            ;

        } catch (error) {
            console.log('errore sincrono in ngOnInit');
            console.log(error);

            const candidate = error as {error?: {error?: string}; message?: string};
            this.taxonomyError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare tipi e categorie'
            );
            this.taxonomyLoading.set(false);
        }
    }


    navigateToNextStepFrom(currentSection: any) {
        this.currentStep =
            Object.keys(this.sections)
                .map((sectionField: string) => this.sections[sectionField].step)
                .filter((step: number) => step === currentSection.step)
                .reduce(getLastElementOr, 0)
        +1
        ;
        this.activeAccordionValue =
            Object.keys(this.sections)
                // .find((sectionField: string) => ( this.sections[sectionField].step === this.currentStep )).value
                .map((sectionField: string) => {
                    // console.log(`controllo ${ sectionField }(${ this.sections[sectionField].step }) con ${ (this.currentStep +1) } = ${ ( this.sections[sectionField].step === (this.currentStep +1) ) }`);
                    if( this.sections[sectionField].step === this.currentStep ) return this.sections[sectionField].value;
                    return null;
                })
                .filter((section: any) => !!section)
                .reduce(getLastElementOr, this.sections.init.value)
        ;

        console.log('navigazione negli step');
        console.log(this.currentStep);
        console.log(this.activeAccordionValue);
    }



    isDisabled( section: any ) {

        let currentSection =
            Object.keys(this.sections)
                .map((sectionField: string) => {
                    if( this.sections[sectionField].value === this.activeAccordionValue ) return this.sections[sectionField];
                    return null;
                })
                .filter((section: any) => !!section)
                .reduce(getLastElementOr, this.sections.init)
        ;

        // console.log('controllo isDisabled');
        // console.log(`per la section ${ section.value }: ${ this.currentStep } - ${ currentSection.step } - ${ section.step }`);
        return (
            (this.currentStep > section.step +1 )
            || (this.currentStep < (section.step ))
        );

    }

    // # 00 > 01
    commisioningTypeSelected(deviceKnowledge: string) {
        // this.currentStep = (this.currentStep === 0 ) ? 1 : this.currentStep;
        // this.currentStep = 1;
        this.deviceKnowledgeType = deviceKnowledge;

        // selezione card
        if( deviceKnowledge === 'newDevice' ) {
            this.newDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-2);'
            this.newDeviceIcon.nativeElement.style.cssText = '; opacity: 1;'
            this.knownDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-0);'
            this.knownDeviceIcon.nativeElement.style.cssText = '; opacity: 0.3;'
        }
        else {
            this.newDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-0);'
            this.newDeviceIcon.nativeElement.style.cssText = '; opacity: 0.3;'
            this.knownDeviceElement.nativeElement.style.cssText = '; color: var(--color-text-2);'
            this.knownDeviceIcon.nativeElement.style.cssText = '; opacity: 1;'
        }

        this.navigateToNextStepFrom(this.sections.init);

    }

    // # 01 > 02
    deviceVendorTypeSelected(family: string) {
        this.integration = family;
        this.selectedFunctionalType = '';
        this.selectedUsage = '';
        this.selectedCatalogItemId = '';
        this.navigateToNextStepFrom(this.sections.family);
    }



    // # 02 > 03
    selectCatalogItemId(id: string) {
        this.selectedCatalogItemId = id;
        this.navigateToNextStepFrom(this.sections.type);

    }


    // # 03 > 04
    functionalTypeSelected(): void {
        this.selectedUsage = this.selectedCatalogItem()?.usage ?? '';

        const catalogItem = this.selectedCatalogItem();
        const selectedTypeId = this.selectedFunctionalTypeObj?.id;
        const typeDefinition = this.taxonomy().types.find(
            type => type.id === selectedTypeId
        );

        if (!catalogItem || !typeDefinition) {
            // Mostrare un errore e non avanzare
            return;
        }

        this.selectedFunctionalType = typeDefinition.id;

        const categoryDefinition = this.taxonomy().categories.find(
            category => category.id === typeDefinition.category
        );

        if (!categoryDefinition) {
            return;
        }


        console.log('controllo tassonmia scelta');
        // console.log(catalogCorrispondent);
        /*
        {
          "id": "LAMP",
          "name": "Lampada",
          "svgIcon": "icon-325",
          "emojIcon": "light_bulb",
          "imgIcon": null,
          "description": "Carico per illuminazione",
          "source": "USAGE",
          "usage": "LAMP",
          "compatibleTypes": [
            "SWITCH",
            "METERED_SWITCH",
            "DIMMER",
            "METERED_DIMMER",
            "COLOR_DIMMER",
            "POWER_METER"
          ]
        }
         */
        // console.log(catalogType);
        /*
        {
          "id": "METERED_SWITCH",
          "name": "Interruttore ON/OFF con misura",
          "category": "SENSOR_ACTUATOR",
          "description": "Comando ON/OFF e misura della potenza o energia"
        }
         */
        // console.log(catalogCategory);
        /*
        {
          "id": "SENSOR_ACTUATOR",
          "name": "Sensore e attuatore",
          "description": "Produce misure e riceve comandi funzionali"
        }
         */
        // console.log(catalogUsage);
        /*
        {
          "id": "LAMP",
          "name": "Lampada",
          "description": "Carico per illuminazione"
        }
         */

        switch (typeDefinition.id) {
            case 'SWITCH':
                this.newDevice.set( VOID_SWITCH );
                break;
            case 'METERED_SWITCH':
                this.newDevice.set( VOID_METRED_SWITCH );
                break;
            case 'TEMPERATURE_HUMIDITY_SENSOR':
                this.newDevice.set( VOID_TEMPERATURE_HUMIDITY_SENSOR );
                break;
        }
        this.deviceForm.controls.deviceName.setValue(catalogItem.name);

        this.newDevice.set({
            ...this.newDevice(),
            family: this.integration,
            catalogItemId: catalogItem.id,
            name: catalogItem.name,
            category: {
                id: categoryDefinition.id,
                name: categoryDefinition.name,
                description: categoryDefinition!.description || '',
            },
            type: {
                id: typeDefinition.id,
                name: typeDefinition.name,
                description: typeDefinition!.description || '',
            },
            svgIcon: catalogItem.svgIcon || '',
            emoj: catalogItem.emojIcon || '',
            imgIcon: catalogItem.imgIcon || ''
        });

        switch(this.integration) {
            case 'shelly':
                this.newDevice.set({
                    ...this.newDevice(),
                    hardware: VOID_SHELLY_FAMILY,
                });

                break;

            case 'tuya':
                this.newDevice.set({
                    ...this.newDevice(),
                    hardware: VOID_TUYA_FAMILY,
                });

                break;

            // l'id dell'hardware sarà il node ID restituito dal commissioning
            case 'matter':
                this.newDevice.set({
                    ...this.newDevice(),
                    hardware: {...VOID_DEVICE_FAMILY, id: ''},
                });

                break;
        }



        console.log('newDevice');
        console.log(this.newDevice);

        if( this.integration.trim().toLowerCase() === 'shelly' ) {
            this.loadIpDevices();
        }
        this.loadRooms();
        this.navigateToNextStepFrom(this.sections.feature);
        // this.navigateToNextStepFrom(this.sections.commissioning);

    }


    onIpDeviceChange(device: NetworkIdentity): void {
        this.selectedIpDevice = device;


        // ATTENZIONE da controllare
        this.deviceForm.controls.deviceIp.setValue(device.ip);

        console.log('Nuovo valore:', this.selectedIpDevice);
        /*
        {
          "ip": "192.168.1.9",
          "mac": "30:30:F9:E6:7B:C0",
          "vendor": "Espressif",
          "privateMac": false,
          "deviceManufacturer": "Shelly",
          "productName": "Shelly Mini 1PM Gen3",
          "hostname": "shelly1pmminig3-3030f9e67bc0",
          "deviceType": "IoT device",
          "operatingSystem": null,
          "httpTitle": null,
          "identificationSource": "shelly-api",
          "shelly": {
            "name": null,
            "id": "shelly1pmminig3-3030f9e67bc0",
            "mac": "30:30:F9:E6:7B:C0",
            "model": "S3SW-001P8EU",
            "type": null,
            "app": "Mini1PMG3",
            "generation": 3,
            "firmware": "1.1.99-minig3prod1"
          },
          "services": [
            {
              "port": 80,
              "protocol": "tcp",
              "name": "http",
              "product": "Shelly Mini 1PM Gen3",
              "version": "1.1.99-minig3prod1",
              "extraInfo": "Shelly Gen3",
              "hostname": "shelly1pmminig3-3030f9e67bc0",
              "tunnel": null,
              "deviceType": "IoT device",
              "operatingSystem": null,
              "cpe": [],
              "httpTitle": null
            }
          ]
        }
         */

        if(
            ((!!this.selectedIpDevice.deviceManufacturer) && ( this.selectedIpDevice.deviceManufacturer!.trim().toLowerCase() === 'shelly' ))
            || (!!this.selectedIpDevice.shelly )
        ) {
            this.newDevice.set({
                ...this.newDevice(),
                ip: device.ip,
                mac: device.mac,
                hardware: {
                    ...(this.newDevice().hardware as ShellyFamilyType),
                    id: device.shelly!.id,
                    name: this.newDevice().hardware.name || '',
                    gen: device.shelly!.generation,
                    model: device.shelly!.model
                } as ShellyFamilyType,
                model: device.shelly!.model || '',
                firmware: device.shelly!.firmware || '',
                productName: device.productName || '',
                hostName: device.hostname || '',
                name: this.deviceForm.controls.deviceName.value || device.productName || ''
            });
        }
        else {
            this.newDevice.set({
                ...this.newDevice(),
                ip: device.ip,
                mac: device.mac,
                hardware: {
                    ...this.newDevice().hardware
                },
                model: '',
                firmware: '',
                productName: device.productName || '',
                hostName: device.hostname || '',
                name: this.deviceForm.controls.deviceName.value || device.productName || ''
            });
        }




        /*
            "productName": "Shelly Mini 1PM Gen3",
            "hostname": "shelly1pmminig3-3030f9e67bc0",
            "shelly": {
                "id": "shelly1pmminig3-3030f9e67bc0",
                "model": "S3SW-001P8EU",
                "generation": 3,
                "firmware": "1.1.99-minig3prod1"
        */

        /*
        {
          "name": "",
          "ip": "",
          "mac": "",
          "where": {
            "id": 0,
            "name": "",
            "picture": ""
          },
          "onMap": "",
          "description": "",
          "picture": "",
        }
         */

        console.log('newDevice');
        console.log(this.newDevice());



        /*
        {
              "id": 0,
              "family": "shelly",
              "hardware": {
                "id": 0,
                "name": "",
                "gen": "",
                "systemConfig": {
                  "device": {
                    "name": "",
                    "mac": "",
                    "fw_id": "",
                    "discoverable": true,
                    "eco_mode": false
                  },
                  "location": {
                    "tz": "",
                    "lat": 0,
                    "lon": 0
                  },
                  "debug": {
                    "level": 0,
                    "file_level": {},
                    "mqtt": {},
                    "websocket": {},
                    "udp": {}
                  },
                  "ui_data": {},
                  "rpc_udp": {
                    "dst_addr": "",
                    "listen_port": ""
                  },
                  "sntp": {
                    "server": ""
                  },
                  "cfg_rev": 0
                },
                "systemStatus": {
                  "mac": "",
                  "restart_required": false,
                  "time": "",
                  "unixtime": 0,
                  "uptime": 0,
                  "ram_size": 0,
                  "ram_free": 0,
                  "fs_size": 0,
                  "fs_free": 0,
                  "cfg_rev": 0,
                  "kvs_rev": 0,
                  "schedule_rev": 0,
                  "webhook_rev": 0,
                  "available_updates": {
                    "stable": {}
                  },
                  "reset_reason": 0
                },
                "wifiConfig": {
                  "ap": {
                    "ssid": "",
                    "is_open": true,
                    "enable": true,
                    "range_extender": {}
                  },
                  "sta": {
                    "ssid": "",
                    "is_open": true,
                    "enable": true,
                    "ipv4mode": "",
                    "ip": {},
                    "netmask": {},
                    "gw": {},
                    "nameserver": {}
                  },
                  "sta1": {
                    "ssid": "",
                    "is_open": true,
                    "enable": true,
                    "ipv4mode": "",
                    "ip": {},
                    "netmask": {},
                    "gw": {},
                    "nameserver": {}
                  },
                  "roam": {
                    "rssi_thr": 0,
                    "interval": 0
                  }
                },
                "wifiStatus": {
                  "sta_ip": "",
                  "status": "",
                  "ssid": "",
                  "rssi": 0
                },
                "cloudConfig": {
                  "enable": true,
                  "server": ""
                },
                "cloudStatus": {
                  "connected": false
                }
              },
              "model": "",
              "matter": {
                "id": 0,
                "mode": "",
                "nodeID": 0,
                "fabricID": 0,
                "endpiontIDs": [
                  0
                ],
                "bridgeEndpiontIDs": [
                  0
                ]
              },
              "name": "",
              "ip": "",
              "mac": "",
              "where": {
                "id": 0,
                "name": "",
                "picture": ""
              },
              "onMap": "",
              "description": "",
              "signalStatus": 0,
              "cloud": "",
              "firmware": "",
              "availability": "",
              "catalogItemId": "",
              "type": {
                "id": "METERED_SWITCH",
                "name": "Interruttore ON/OFF con misura",
                "description": "Comando ON/OFF e misura della potenza o energia"
              },
              "category": {
                "id": "SENSOR_ACTUATOR",
                "name": "Sensore e attuatore",
                "description": "Produce misure e riceve comandi funzionali"
              },
              "svgIcon": "",
              "emoj": "",
              "imgIcon": "",
              "picture": "",
              "channel": [
                ""
              ],
              "status": [
                ""
              ],
              "lastTime": [
                ""
              ],
              "unit": [
                ""
              ],
              "value": [
                ""
              ],
              "minThreshold": [
                ""
              ],
              "maxThreshold": [
                ""
              ]
            }
         */




        // console.log('controllo il selectedUsage');
        // console.log(this.selectedUsage);
        // console.log(this.selectedFunctionalTypeObj.description);
        // console.log(this.selectedCatalogItemId);


        this.navigateToNextStepFrom(this.sections.commissioning);

    }

    selectedTypeDefinition(): DeviceTypeDefinition | null {
        return this.taxonomy().types.find(type => type.id === this.selectedFunctionalType) ?? null;
    }

    selectedCatalogItem(): DeviceCatalogItem | null {
        return this.catalog().find(item => item.id === this.selectedCatalogItemId) ?? null;
    }

    selectedCatalogItemEmoj(): string {
        let catalogItem: DeviceCatalogItem | null = this.selectedCatalogItem();
        if( !!catalogItem ) {
            return emoj( catalogItem.emojIcon || '' );
        }
        return '';
    }

    compatibleTypeDefinitions(): DeviceTypeDefinition[] {
        const compatibleTypes = this.selectedCatalogItem()?.compatibleTypes ?? [];
        return compatibleTypes
            .map(id => this.taxonomy().types.find(type => type.id === id))
            .filter((type): type is DeviceTypeDefinition => type !== undefined);
    }



    loadIpDevices() {
        this.devicesLoading.set(true);
        this.devicesError.set(null);
        try {
            console.log('caricamento dispositivi IP: ' + this.devicesLoading());

            firstValueFrom(this.api.newDevicesNetScan())
                .then((ipDevices: NetworkIdentity[]) => {
                    console.log(ipDevices);
                    this.devices.set(
                        ipDevices

                            // ordinamento: prima i dispositivi della famiglia scelta
                            .sort((a: NetworkIdentity, b: NetworkIdentity) => {
                                if(
                                    (!!a.deviceManufacturer && !!b.deviceManufacturer)
                                    && (a.deviceManufacturer!.toLowerCase().trim() === this.integration.toLowerCase().trim())
                                ) {
                                    return 1;
                                }
                                return 0;
                            })

                            // soltanto i dispositivi della famiglia scelta
                            // .filter((ipDevice: NetworkIdentity) => (ipDevice.deviceManufacturer?.trim().toLowerCase() === this.integration.trim().toLowerCase()))

                            // filtro: soltanto i dispositivi della famiglia scelta
                            // .filter((ipDevice: NetworkIdentity) => (
                            //     (!!ipDevice.deviceManufacturer)
                            //     && (ipDevice.deviceManufacturer!.toLowerCase().trim() === this.integration.toLowerCase().trim())
                            // ))
                    );
                    this.devicesLoading.set(false);
                    console.log('caricamento dispositivi IP: ' + this.devicesLoading());

                })
                .catch((e: any) => {
                    console.log('errore in loadIpDevices');
                    console.log(e);

                    // l'errore arriva in modo asincrono: il try/catch esterno non
                    // lo vede, quindi messaggio e attesa si chiudono qui
                    const candidate = e as {error?: {error?: string}; message?: string};
                    this.devicesError.set(
                        candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
                    );
                    this.devicesLoading.set(false);
                })


        } catch (error) {
            console.log('errore sincrono in loadIpDevices');
            console.log(error);

            const candidate = error as {error?: {error?: string}; message?: string};
            this.devicesError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
            );
            this.devicesLoading.set(false);
        } finally {
            // this.devicesLoading.set(false);
        }
    }


    loadRooms() {
        this.isRoomsInWaiting.set(true);

        try {
            console.log('caricamento stanze');

            firstValueFrom(this.api.getAllRooms())
                .then((allRooms: ZoneType[]) => {

                    // aggiunta della no-zone
                    allRooms.push({id: -1, name: 'Nessuna Stanza', device_list: '', picture: ''})

                    console.log(allRooms);
                    this.rooms.set(allRooms);
                    this.isRoomsInWaiting.set(false);
                })
                .catch((e: any) => {
                    console.log('errore in loadRooms: stanze per il nuovo dispositivo');
                    console.log(e);

                    // l'errore arriva in modo asincrono: il try/catch esterno non
                    // lo vede, quindi messaggio e attesa si chiudono qui
                    const candidate = e as {error?: {error?: string}; message?: string};
                    this.devicesError.set(
                        candidate.error?.error ?? candidate.message ?? 'Impossibile caricare le stanze'
                    );
                    this.isRoomsInWaiting.set(false);
                })


        } catch (error) {
            console.log('errore sincrono in loadRooms');
            console.log(error);

            const candidate = error as {error?: {error?: string}; message?: string};
            this.devicesError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare le stanze'
            );
            this.isRoomsInWaiting.set(false);
        }
    }


    copyNewDeviceData(event: PointerEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        try {
            navigator.clipboard.writeText( JSON.stringify(this.newDevice()) )
                .then(() => {
                    this.isCopied.set(true);
                })
                .catch((e: any) => {
                    console.log('errore in copyNewDeviceData: copia del nuovo dispositivo negli appunti');
                    console.log(e);
                })
            ;

        } catch (error) {
            console.log('errore sincrono in copyNewDeviceData');
            console.log(error);
        }
    }

    openNewDeviceDateTree() {
        this.newDeviceDataTreePanelOpen.set(true);
    }

    newDeviceDataTreePanelClose() {
        this.newDeviceDataTreePanelOpen.set(false);
    }

    addNewDevice() {
        this.inWaiting.set(true);

        firstValueFrom(this.api.addNewDevice(this.newDevice()))
            .then((data: any) => {
                console.log('fine chiamata per aggiunta nuovo dispositivo');
                console.log( data );
                this.newDevice.set( data );
                this.inWaiting.set(false);
                this.router.navigate(['/devices-page']);

            })
            .catch((e: any) => {
                console.log('errore in addNewDevice');
                console.log(e);
                this.inWaiting.set(false);

                // TODO messaggio di errore
            })


        // console.log(`nome dispositivo: ${ this.deviceName.nativeElement.value }`);
        // setTimeout(() => {
        //     this.inWaiting.set(false);
        // }, 200000)
    }

    onRoomChange(event: ZoneType) {
        this.selectedRoom = event;

        this.newDevice.update(() => ({
            ...this.newDevice(),
            where: [{id: event.id, name: event.name, picture: event.picture, device_list: event.device_list}]
        }));

        console.log(`zona selezionata ${ event.name }`);
        this.navigateToNextStepFrom(this.sections.room);

    }


    setDeviceData() {
        this.newDevice.update(() => ({
            ...this.newDevice(),
            name: this.deviceName.nativeElement.value
        }));
    }

    protected setTuyaDeviceData() {

        // console.log('dispositivo aggiornato con il Tuya Device ID')
        // console.log(this.deviceTuyaMac);
        // console.log(this.deviceTuyaMac.nativeElement);
        // console.log(this.deviceTuyaMac.nativeElement.value);

        // basta uno dei due: il Core ricava l'altro dal cloud Tuya
        if(!!this.deviceTuyaVirtualID.nativeElement.value.trim() || !!this.deviceTuyaMac.nativeElement.value.trim()) {
            this.newDevice.update(() => ({
                ...this.newDevice(),
                // il MAC sta nel campo di primo livello, come per Shelly
                mac: this.deviceTuyaMac.nativeElement.value.trim(),
                // il Tuya Device ID è l'external_id dell'hardware nel Core; vuoto = assente
                hardware: {
                    ...this.newDevice().hardware,
                    id: this.deviceTuyaVirtualID.nativeElement.value.trim()
                } as TuyaFamilyType
            }));
            console.log(this.newDevice);

            this.navigateToNextStepFrom(this.sections.commissioning);
        }

    }


    // Porta il dispositivo nella fabric LipariOS con il codice manuale o il testo del QR (MT:...):
    // a job completato il node ID diventa hardware.id e si passa al passo successivo
    protected startMatterCommissioning() {
        const pairingCode = this.matterPairingCode.nativeElement.value.trim();
        if (!pairingCode) {
            this.matterError.set('Inserisci il codice di pairing del dispositivo');
            return;
        }

        this.inWaiting.set(true);
        this.matterError.set(null);
        this.matterDetectedType.set(null);

        firstValueFrom(this.deviceApi.commissionMatter({pairingCode}))
            .then((job: CommissioningJob) => this.waitMatterCommissioningJob(job.id, 150))
            .then((job: CommissioningJob) => {
                this.inWaiting.set(false);
                if (job.status !== 'COMPLETED' || !job.device?.matterNodeId) {
                    this.matterError.set(job.error || 'Commissioning non concluso: riprova');
                    return;
                }
                this.matterDetectedType.set(job.device.detectedDeviceType);
                this.newDevice.update(() => ({
                    ...this.newDevice(),
                    ip: job.device!.address ?? '',
                    hardware: {...this.newDevice().hardware, id: job.device!.matterNodeId!}
                }));
                this.navigateToNextStepFrom(this.sections.commissioning);
            })
            .catch((e: any) => {
                console.log('errore in startMatterCommissioning: commissioning del dispositivo Matter');
                console.log(e);
                this.matterError.set(e?.error?.error || 'Commissioning Matter non riuscito');
                this.inWaiting.set(false);
            });
    }

    // controlla il job una volta al secondo finché finisce o finiscono i tentativi
    private waitMatterCommissioningJob(jobId: string, attempts: number): Promise<CommissioningJob> {
        return new Promise<void>(resolve => setTimeout(resolve, 1000))
            .then(() => firstValueFrom(this.deviceApi.commissioningJob(jobId)))
            .then((job: CommissioningJob) => (
                (job.status === 'COMPLETED' || job.status === 'FAILED' || attempts <= 1)
                    ? job
                    : this.waitMatterCommissioningJob(jobId, attempts - 1)
            ))
            .catch((e: any) => {
                console.log(`errore in waitMatterCommissioningJob: lettura del job ${jobId}`);
                console.log(e);
                return Promise.reject(e);
            });
    }
}
