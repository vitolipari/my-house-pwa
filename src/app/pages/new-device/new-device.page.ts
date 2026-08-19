import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {PageTitleComponent} from '../../components/page-title.component/page-title.component';
import {Accordion, AccordionContent, AccordionHeader, AccordionModule, AccordionPanel} from 'primeng/accordion';

import {DeviceApiService} from '../devices/device-api';
import {emoj} from '../../utils/string-utils';
import {RadioButton, RadioButtonModule} from 'primeng/radiobutton';
import {getLastElementOr} from '../../utils/array-util';
import {
    DeviceCatalogItem, DeviceCategory, DeviceRecord,
    DeviceTaxonomy, DeviceTipology,
    DeviceType,
    DeviceTypeDefinition, ShellyFamilyType,
    SwitchType
} from '../devices/devices.models';
import {Listbox, ListboxModule} from 'primeng/listbox';
import {
    DeviceIpBlockComponent,
    NetworkIdentity
} from '../../components/device-ip-block.component/device-ip-block.component';
import {ApiUrlService} from '../../services/api-url-service';


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
        Listbox
    ],
    templateUrl: './new-device.page.html',
    styleUrls: [
        // '../../components/page-title.component/page-title.component.css',
        './new-device.page.css'
    ],
    standalone: true
})
export class NewDevicePage implements OnInit {


    activeAccordionValue: string | number | string[] | number[] | null | undefined = '0';
    step: number = 0;
    deviceKnowledgeType: string = '';
    integration: string = '';
    // selectedType: any;
    selectedFunctionalType: string = '';
    selectedFunctionalTypeObj: any;
    selectedUsage: string = '';
    selectedCatalogItemId: string = '';

    isInScanning = signal(true);
    ipDevices: NetworkIdentity[] = [];
    selectedIpDevice!: NetworkIdentity;
    readonly devices = signal<NetworkIdentity[]>([]);
    readonly devicesLoading = signal(true);
    readonly devicesError = signal<string | null>(null);


    newDevice!: DeviceType;
    deviceReady: any;

    private readonly deviceApi = inject(DeviceApiService);
    private readonly api = inject<ApiUrlService>(ApiUrlService);
    readonly catalog = signal<DeviceCatalogItem[]>([]);
    readonly taxonomy = signal<DeviceTaxonomy>({categories: [], types: [], usages: []});
    readonly taxonomyLoading = signal(true);
    readonly taxonomyError = signal<string | null>(null);
    @ViewChild("newDevice", {static: true, read: ElementRef}) newDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("newDeviceIcon", {static: true, read: ElementRef}) newDeviceIcon!: ElementRef<SVGElement>;
    @ViewChild("knownDevice", {static: true, read: ElementRef}) knownDeviceElement!: ElementRef<HTMLDivElement>;
    @ViewChild("knownDeviceIcon", {static: true, read: ElementRef}) knownDeviceIcon!: ElementRef<SVGElement>;

    async ngOnInit(): Promise<void> {
        try {
            const [taxonomy, catalog] = await Promise.all([
            firstValueFrom(this.deviceApi.taxonomy()),
                firstValueFrom(this.deviceApi.catalog())
            ]);

            console.log('response di taxonomy');
            console.log(taxonomy);

            console.log('response di catalog');
            console.log(catalog);


            this.taxonomy.set(taxonomy);
            this.catalog.set(catalog);
        } catch (error) {
            const candidate = error as {error?: {error?: string}; message?: string};
            this.taxonomyError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare tipi e categorie'
            );
        } finally {
            this.taxonomyLoading.set(false);
        }
    }

    commisioningTypeSelected(deviceKnowledge: string) {
        // this.step = (this.step === 0 ) ? 1 : this.step;
        this.step = 1;
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

        this.activeAccordionValue = ''+ this.step;


    }


    deviceVendorTypeSelected(family: string) {
        this.integration = family;
        this.selectedFunctionalType = '';
        this.selectedUsage = '';
        this.selectedCatalogItemId = '';
        this.step = 2;
        this.activeAccordionValue = ''+ this.step;
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

    catalogItemSelected(): void {
        this.selectedFunctionalType = '';
        this.selectedUsage = this.selectedCatalogItem()?.usage ?? '';
    }

    typeSupportsUsage(): boolean {
        return [
            'SWITCH',
            'METERED_SWITCH',
            'DIMMER',
            'METERED_DIMMER',
            'COLOR_DIMMER',
            'POWER_METER'
        ].includes(this.selectedFunctionalType);
    }

    functionalTypeSelected(): void {
        this.selectedUsage = this.selectedCatalogItem()?.usage ?? '';



        let catalogCorrispondent = this.catalog().find((cat: any) => cat.id === this.selectedUsage);
        let catalogType = this.taxonomy().types.find((cat: any) => cat.id === this.selectedFunctionalTypeObj.id);
        let catalogCategory = this.taxonomy().categories.find((cat: any) => cat.id === catalogType!.category);
        let catalogUsage = this.taxonomy().usages.find((us: any) => us.id === this.selectedUsage);

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

        this.deviceReady = {};
        this.deviceReady = {...this.deviceReady, family: this.integration};
        switch(this.integration) {
            case 'shelly':
                this.deviceReady.hardware = {
                    id: 0,
                    name: '',
                    gen: '',
                    systemConfig: {},
                    systemStatus: {},
                    wifiConfig: {},
                    wifiStatus: {},
                    cloudConfig: {},
                    cloudStatus: {}
                };

                break;
        }

        switch (catalogType!.id) {
            case 'SWITCH':
            case 'METERED_SWITCH':
                this.deviceReady = {...this.deviceReady};

                break;

        }

        this.deviceReady.category = catalogCategory;
        this.deviceReady.type = catalogType;
        this.deviceReady.svgIcon = catalogCorrispondent!.svgIcon || '';
        this.deviceReady.emoj = catalogCorrispondent!.emojIcon || '';
        this.deviceReady.imgIcon = catalogCorrispondent!.imgIcon || '';


        console.log( this.deviceReady );

        // this.newDevice =


        this.loadDevices();
        this.step = 4;
        this.activeAccordionValue = ''+ this.step;

    }

    selectCatalogItemId(id: string) {
        this.selectedCatalogItemId = id;
        this.step = 3;
        this.activeAccordionValue = ''+ this.step;

    }


    loadDevices() {
        this.devicesLoading.set(true);
        this.devicesError.set(null);
        try {
            console.log('caricamento dispositivi IP: ' + this.devicesLoading());

            firstValueFrom(this.api.netScan())
                .then((ipDevices: NetworkIdentity[]) => {
                    console.log(ipDevices);
                    this.devices.set(
                        ipDevices.filter((ipDevice: NetworkIdentity) => (
                            (!!ipDevice.deviceManufacturer)
                            && (ipDevice.deviceManufacturer!.toLowerCase().trim() === this.integration.toLowerCase().trim())
                        ))
                    );
                    this.devicesLoading.set(false);
                    console.log('caricamento dispositivi IP: ' + this.devicesLoading());
                })
                .catch((e: any) => {
                    console.log('errore nel catch di device-list');
                    throw e;
                })


        } catch (error) {
            const candidate = error as {error?: {error?: string}; message?: string};
            this.devicesError.set(
                candidate.error?.error ?? candidate.message ?? 'Impossibile caricare i dispositivi'
            );
        } finally {
            // this.devicesLoading.set(false);
        }
    }

}
