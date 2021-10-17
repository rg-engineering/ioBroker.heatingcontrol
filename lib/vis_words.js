"use strict";

const heatingcontrolDictionary = {
    "room": { "en": "room", "de": "Raum", "ru": "комната", "pt": "quarto", "nl": "kamer", "fr": "salle", "it": "camera", "es": "habitación", "pl": "Pokój", "zh-cn": "房间" },
    "status": { "en": "status", "de": "Status", "ru": "статус", "pt": "status", "nl": "toestand", "fr": "statut", "it": "stato", "es": "estado", "pl": "status", "zh-cn": "状态" },
    "since": { "en": "since", "de": "seit", "ru": "с", "pt": "Desde a", "nl": "sinds", "fr": "puisque", "it": "da", "es": "ya que", "pl": "od", "zh-cn": "自从" },
    "opened": { "en": "opened", "de": "geöffnet", "ru": "открыто", "pt": "aberto", "nl": "geopend", "fr": "ouvert", "it": "ha aperto", "es": "abrió", "pl": "otwierany", "zh-cn": "开了" },
    "closed": { "en": "closed", "de": "geschlossen", "ru": "закрыто", "pt": "fechado", "nl": "Gesloten", "fr": "fermé", "it": "Chiuso", "es": "cerrado", "pl": "Zamknięte", "zh-cn": "关闭" },
    "target": { "en": "target", "de": "Ziel", "ru": "цель", "pt": "alvo", "nl": "doelwit", "fr": "cibler", "it": "bersaglio", "es": "objetivo", "pl": "cel", "zh-cn": "目标" },
    "current": { "en": "current value", "de": "aktueller Wert", "ru": "текущее значение", "pt": "valor atual", "nl": "huidige waarde", "fr": "valeur actuelle", "it": "valore corrente", "es": "valor actual", "pl": "Bieżąca wartość", "zh-cn": "当前值" },
    "actuator": { "en": "actuator", "de": "Aktor", "ru": "привод", "pt": "atuador do", "nl": "aandrijving", "fr": "actionneur", "it": "attuatore", "es": "solenoide", "pl": "Uruchamiacz", "zh-cn": "执行器" },
    "window": { "en": "window", "de": "Fenster", "ru": "окно", "pt": "janela", "nl": "venster", "fr": "la fenêtre", "it": "finestra", "es": "ventana", "pl": "okno", "zh-cn": "窗户" },
    "on": { "en": "on", "de": "ein", "ru": "включено", "pt": "sobre", "nl": "Aan", "fr": "sur", "it": "su", "es": "en", "pl": "na", "zh-cn": "在" },
    "off": { "en": "off", "de": "aus", "ru": "выключено", "pt": "desligado", "nl": "uit", "fr": "désactivé", "it": "spento", "es": "apagado", "pl": "poza", "zh-cn": "离开" },

    "WindowState": { "en": "Window State", "de": "Fensterstatus", "ru": "Состояние окна", "pt": "Estado da janela", "nl": "Vensterstatus", "fr": "État de la fenêtre", "it": "Stato finestra", "es": "Estado de la ventana", "pl": "Stan okna", "zh-cn": "窗口状态" },
    "AllWindowsClosed": { "en": "All Window Closed", "de": "Alle Fenster geschlossen", "ru": "Все окна закрыты", "pt": "Todas as janelas fechadas", "nl": "Alle ramen gesloten", "fr": "Toutes les fenêtres sont fermées", "it": "Tutte le finestre chiuse", "es": "Todas las ventanas cerradas", "pl": "Wszystkie okna zamknięte", "zh-cn": "所有窗口关闭" },
    "WindowOpen": { "en": "Window Open", "de": "Fenster offen", "ru": "Окно открыто", "pt": "Janela aberta", "nl": "Venster open", "fr": "Fenêtre ouverte", "it": "Finestra aperta", "es": "Ventana abierta", "pl": "Okno otwarte", "zh-cn": "开窗" },

    //cardHzngGlobals
    "HeatingPeriodActive": { "en": "HeatingPeriodActive", "de": "Heizperiode aktiv", "ru": "Период нагрева активен", "pt": "Período de aquecimento ativo", "nl": "Verwarmingsperiode actief", "fr": "Période de chauffage active", "it": "Periodo di riscaldamento attivo", "es": "Período de calentamiento activo", "pl": "Aktywny okres ogrzewania", "zh-cn": "加热时间有效" },
    "PublicHolidayToday": { "en": "PublicHoliday  Today", "de": "Feiertag heute", "ru": "Государственный праздник сегодня", "pt": "Feriado Público Hoje", "nl": "Feestdag vandaag", "fr": "Jour férié aujourd'hui", "it": "Festa pubblica oggi", "es": "Día festivo hoy", "pl": "Dzisiaj święto państwowe", "zh-cn": "今天的公众假期" },
    "Present": { "en": "Present", "de": "Anwesend", "ru": "Присутствие", "pt": "Presente", "nl": "Cadeau", "fr": "Cadeau", "it": "Presente", "es": "Regalo", "pl": "Teraźniejszość", "zh-cn": "当下" },
    "PartyNow": { "en": "Party now", "de": "Party jetzt", "ru": "Сейчас вечеринка", "pt": "agora festa", "nl": "nu feest", "fr": "maintenant Party", "it": "ora partito", "es": "ahora fiesta", "pl": "teraz Party", "zh-cn": "现在聚会" },
    "Guests": { "en": "Guests", "de": "Gäste", "ru": "Гости", "pt": "Convidados", "nl": "Gasten", "fr": "Invités", "it": "Ospiti", "es": "Huéspedes", "pl": "Goście", "zh-cn": "来宾" },
    "HolidayAtHome": { "en": "Holiday At Home", "de": "Urlaub zu Hause", "ru": "Отпуск дома", "pt": "Férias em casa", "nl": "Vakantie thuis", "fr": "Vacances à la maison", "it": "Vacanze a casa", "es": "Vacaciones en casa", "pl": "Wakacje w domu", "zh-cn": "在家度假" },
    "HolidayVacation": { "en": "Vacation away", "de": "Urlaub abwesend", "ru": "Отпуск не дома", "pt": "Férias longe", "nl": "Vakantie weg", "fr": "Vacances loin", "it": "Vacanze lontane", "es": "Vacaciones lejos", "pl": "Wakacje daleko", "zh-cn": "度假了" },
    "FireplaceMode": { "en": "Fireplace Mode","de": "Kaminmodus","ru": "Каминный режим","pt": "Modo lareira","nl": "Open haard modus","fr": "Mode Cheminée","it": "Modalità camino","es": "Modo chimenea","pl": "Tryb kominkowy","zh-cn": "壁炉模式"},
    "MaintenanceMode": {"en": "Maintenance Mode","de": "Wartungsmodus","ru": "Режим технического обслуживания","pt": "Modo de manutenção","nl": "onderhoudsstand","fr": "Mode de Maintenance","it": "Modalità di manutenzione","es": "Modo de mantenimiento", "pl": "tryb konserwacji","zh-cn": "维护模式"},
    "General": { "en": "General", "de": "Allgemeines", "ru": "Общий", "pt": "Em geral", "nl": "Algemeen", "fr": "Général", "it": "Generale", "es": "General", "pl": "Generał", "zh-cn": "一般的" },

    //cardHzngMoFrSaSo
    "Period": { "en": "Period", "de": "Per.", "ru": "Период", "pt": "Período", "nl": "Periode", "fr": "Point final", "it": "Periodo", "es": "Período", "pl": "Kropka", "zh-cn": "时期" },
    "MoFr": { "en": "Mo. to Fr.", "de": "Mo. bis Fr.", "ru": "Пн-Пт.", "pt": "Mo. a Fr.", "nl": "Ma. Tot vr.", "fr": "Lu au Fr.", "it": "Lu. A P.", "es": "Mo. al P.", "pl": "Pon. Do ks.", "zh-cn": "Mo.到Fr." },
    "From": { "en": "from", "de": "von", "ru": "с", "pt": "a partir de", "nl": "van", "fr": "de", "it": "a partire dal", "es": "desde", "pl": "od", "zh-cn": "从" },
    "SaSu": { "en": "Sa. to Su.", "de": "Sa. bis So.", "ru": "сб. к вс.", "pt": "Sa. para Su.", "nl": "Za. naar zo.", "fr": "Sa. à Su.", "it": "Sa. a Su.", "es": "Sa. a su.", "pl": "Sa. do Su.", "zh-cn": "萨来苏。" },

    //cardHzngMoSu
    "MoSu": { "en": "Mo. to Su.", "de": "Mo. bis So.", "ru": "Пн до вс.", "pt": "Mo. para Su.", "nl": "Ma. Tot zo.", "fr": "Lu au Su.", "it": "Lu a Su.", "es": "Mo. a Su.", "pl": "Pon. Do Nie.", "zh-cn": "莫到苏。" },

    //cardHzngMoSuSeparat
    "Monday": { "en": "Monday", "de": "Montag", "ru": "понедельник", "pt": "Segunda-feira", "nl": "maandag", "fr": "Lundi", "it": "Lunedi", "es": "lunes", "pl": "poniedziałek", "zh-cn": "周一" },
    "Tuesday": { "en": "Tuesday", "de": "Dienstag", "ru": "вторник", "pt": "terça-feira", "nl": "dinsdag", "fr": "mardi", "it": "martedì", "es": "martes", "pl": "wtorek", "zh-cn": "周二" },
    "Wednesday": { "en": "Wednesday", "de": "Mittwoch", "ru": "среда", "pt": "quarta-feira", "nl": "woensdag", "fr": "Mercredi", "it": "mercoledì", "es": "miércoles", "pl": "środa", "zh-cn": "周三" },
    "Thursday": { "en": "Thursday", "de": "Donnerstag", "ru": "четверг", "pt": "quinta-feira", "nl": "donderdag", "fr": "jeudi", "it": "giovedi", "es": "jueves", "pl": "czwartek", "zh-cn": "周四" },
    "Friday": { "en": "Friday", "de": "Freitag", "ru": "пятница", "pt": "sexta-feira", "nl": "vrijdag", "fr": "vendredi", "it": "Venerdì", "es": "viernes", "pl": "piątek", "zh-cn": "星期五" },
    "Saturday": { "en": "Saturday", "de": "Samstag", "ru": "суббота", "pt": "sábado", "nl": "zaterdag", "fr": "samedi", "it": "Sabato", "es": "sábado", "pl": "sobota", "zh-cn": "周六" },
    "Sunday": { "en": "Sunday", "de": "Sonntag", "ru": "воскресенье", "pt": "domingo", "nl": "zondag", "fr": "dimanche", "it": "Domenica", "es": "domingo", "pl": "niedziela", "zh-cn": "星期日" },
    "ZeitenWoche": { "en": "Times / week ", "de": "Zeiten / Woche", "ru": "Раз / неделя", "pt": "Vezes / semana", "nl": "Tijden / week", "fr": "Horaires / semaine", "it": "Tempi / settimana", "es": "Tiempos / semana", "pl": "Razy / tydzień", "zh-cn": "次/周" },

    //cardHzngProfilParam
    "GuestIncrease": { "en": "Guest: Increase", "de": "Gast: Anhebung", "ru": "Гости: Увеличить", "pt": "Convidado: Aumento", "nl": "Gast: verhogen", "fr": "Invité: Augmentation", "it": "Ospite: aumento", "es": "Invitado: Incrementar", "pl": "Gość: Zwiększ", "zh-cn": "客人：增加" },
    "GuestTemperature": { "en": "Guest temperature", "de": "Gasttemperatur", "ru": "Гости Температура", "pt": "Temperatura do convidado", "nl": "Gast temperatuur", "fr": "Température du client", "it": "Temperatura dell'ospite", "es": "Temperatura del huésped", "pl": "Temperatura gości", "zh-cn": "客体温度" },
    "PartyDecrease": { "en": "Party: Decrease", "de": "Party: Absenkung", "ru": "Вечеринка: Уменьшение", "pt": "Parte: Diminuir", "nl": "Feest: afnemen", "fr": "Parti: Diminuer", "it": "Party: diminuzione", "es": "Partido: Disminuir", "pl": "Impreza: Zmniejsz", "zh-cn": "派对：减少" },
    "PartyTemperature": { "en": "Party temperature", "de": "Partytemperatur", "ru": "Вечеринка Температура", "pt": "Temperatura de festa", "nl": "Party temperatuur", "fr": "Température de fête", "it": "Temperatura del partito", "es": "Temperatura de la fiesta", "pl": "Temperatura imprezy", "zh-cn": "派对温度" },
    "AbsentDecrease": { "en": "Absent: Decrease", "de": "Abwesend: Absenkung", "ru": "Отсутствие: уменьшение", "pt": "Ausente: Diminuir", "nl": "Afwezig: verlagen", "fr": "Absent: Diminuer", "it": "Assente: diminuzione", "es": "Ausente: Disminuir", "pl": "Brak: spadek", "zh-cn": "缺席：减少" },
    "AbsentTemperature": { "en": "Absent temperature", "de": "abwesend Temperatur", "ru": "Отсутствие температура", "pt": "temperatura ausente", "nl": "afwezige temperatuur", "fr": "température absente", "it": "temperatura assente", "es": "temperatura ausente", "pl": "brak temperatury", "zh-cn": "温度不存在" },
    "VacationAbsentDecrease": { "en": "Vacation away: Decrease", "de": "Urlaub abwesend: Absenkung", "ru": "Отпуск не дома: уменьшение", "pt": "Férias fora: diminuir", "nl": "Vakantie weg: verlagen", "fr": "Vacances loin: Diminuer", "it": "Vacanza lontano: diminuzione", "es": "Vacaciones fuera: Disminuir", "pl": "Urlop poza domem: spadek", "zh-cn": "度假：减少" },
    "VacationAbsentTemperature": { "en": "Vacation away temperature", "de": "Urlaub abwesend Temperatur", "ru": "Отпуск не дома температура", "pt": "temperatura de férias longe", "nl": "vakantie weg temperatuur", "fr": "température de vacances", "it": "temperatura in vacanza", "es": "temperatura de vacaciones", "pl": "temperatura poza domem", "zh-cn": "休假温度" },
    "WindowOpenDecrease": { "en": "Window Open: Decrease", "de": "Fenster offen: Absenkung", "ru": "Окно открыто: Уменьшить", "pt": "Janela aberta: diminuir", "nl": "Venster open: verkleinen", "fr": "Fenêtre ouverte: Diminuer", "it": "Finestra aperta: diminuisci", "es": "Ventana abierta: Disminuir", "pl": "Otwarte okno: Zmniejsz", "zh-cn": "开窗：减少" },
    "WindowOpenTemperature": { "en": "window open temperature", "de": "Fensteroffen Temperatur", "ru": "Температура при открытом окне", "pt": "temperatura de janela aberta", "nl": "raam open temperatuur", "fr": "température d'ouverture de la fenêtre", "it": "temperatura finestra aperta", "es": "temperatura de ventana abierta", "pl": "temperatura otwartego okna", "zh-cn": "开窗温度" },
    "OverrideFor": { "en": "Override for", "de": "override für", "ru": "Ручная коррекция до", "pt": "substituir por", "nl": "overschrijven voor", "fr": "remplacer pour", "it": "override per", "es": "anular para", "pl": "zastąpić dla", "zh-cn": "覆盖" },
    "OverrideTemp": { "en": "with", "de": "auf", "ru": "с", "pt": "com", "nl": "met", "fr": "avec", "it": "con", "es": "con", "pl": "z", "zh-cn": "和" },
    "MinimalTemperature": { "en": "Minimum Temperature", "de": "Mindesttemperatur", "ru": "Минимальная температура", "pt": "temperatura mínima", "nl": "minimum temperatuur", "fr": "Température minimale", "it": "Temperatura minima", "es": "temperatura mínima", "pl": "minimalna temperatura", "zh-cn": "最低温度" },
    "HintNotEnabled": { "en": "Controls hidden, no lowering method selected. ", "de": "Steuerelemente ausgeblendet, keine Absenkmethode ausgewählt.", "ru": "Элементы управления скрыты, метод уменьшения не выбран.", "pt": "Controles ocultos, nenhum método de abaixamento selecionado.", "nl": "Bedieningselementen verborgen, geen verlagingsmethode geselecteerd.", "fr": "Contrôles masqués, aucune méthode d'abaissement sélectionnée.", "it": "Controlli nascosti, nessun metodo di abbassamento selezionato.", "es": "Controles ocultos, sin método de descenso seleccionado.", "pl": "Sterowanie ukryte, nie wybrano metody obniżania.", "zh-cn": "控制隐藏，未选择降低方法。" },
    "Profilparam": { "en": "Profile parameters", "de": "Profilparameter", "ru": "Параметры профиля", "pt": "Parâmetro de perfil", "nl": "Profielparameter", "fr": "Paramètre de profil", "it": "Profilparameter", "es": "Parámetro de perfil", "pl": "Parametr profilu", "zh-cn": "轮廓参数" },
    "FireplaceModeDecrease": {"en": "Fireplace Mode: Decrease ","de": "Kaminmodus: Absenkung","ru": "Режим камина: уменьшение","pt": "Modo Lareira: Diminuir","nl": "Open haardmodus: verlagen","fr": "Mode Cheminée : Diminuer","it": "Modalità camino: Diminuisci","es": "Modo chimenea: Disminuir","pl": "Tryb kominka: Zmniejsz","zh-cn": "壁炉模式：减少"},
    "FireplaceModeTemperature": {"en": "Fireplace Mode: Temperature","de": "Kaminmodus: Temperatur","ru": "Режим камина: температура","pt": "Modo lareira: temperatura","nl": "Open haardmodus: temperatuur", "fr": "Mode foyer : température", "it": "Modalità camino: temperatura","es": "Modo de chimenea: temperatura", "pl": "Tryb kominka: temperatura", "zh-cn": "壁炉模式：温度"},

    //tnav
    "ActiveProfile": { "en": "Active profile", "de": "aktives Profil", "ru": "Активный профиль", "pt": "perfil ativo", "nl": "actief profiel", "fr": "profil actif", "it": "profilo attivo", "es": "perfil activo", "pl": "aktywny profil", "zh-cn": "活动资料" },

    //cardHzngRooms
    "RoomState": {
        "en": "Room Status", "de": "Raumstatus", "ru": "Статус комнаты", "pt": "Status da sala", "nl": "Kamerstatus", "fr": "Statut de la chambre", "it": "Stato della camera", "es": "Estado de la habitación", "pl": "Stan pokoju", "zh-cn": "房间状态"
    },

    //cardDateAndTime
    "clock": { "en": "Clock", "de": "Uhrzeit", "ru": "Время", "pt": "relógio", "nl": "klok", "fr": "horloge", "it": "orologio", "es": "reloj", "pl": "zegar", "zh-cn": "钟" }


};


module.exports = {
    heatingcontrolDictionary
};
