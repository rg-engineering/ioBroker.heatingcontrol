"use strict";


const heatingcontrolDictionary = {
    "room": { "en": "room", "de": "Zimmer", "ru": "комната", "pt": "quarto", "nl": "kamer", "fr": "salle", "it": "camera", "es": "habitación", "pl": "Pokój", "zh-cn": "房间" },
    "status": { "en": "status", "de": "Status", "ru": "положение дел", "pt": "status", "nl": "toestand", "fr": "statut", "it": "stato", "es": "estado", "pl": "status", "zh-cn": "状态" },
    "since": { "en": "since", "de": "seit", "ru": "поскольку", "pt": "Desde a", "nl": "sinds", "fr": "puisque", "it": "da", "es": "ya que", "pl": "od", "zh-cn": "自从" },
    "opened": { "en": "opened", "de": "geöffnet", "ru": "открыт", "pt": "aberto", "nl": "geopend", "fr": "ouvert", "it": "ha aperto", "es": "abrió", "pl": "otwierany", "zh-cn": "开了" },
    "closed": { "en": "closed", "de": "geschlossen", "ru": "закрыто", "pt": "fechado", "nl": "Gesloten", "fr": "fermé", "it": "Chiuso", "es": "cerrado", "pl": "Zamknięte", "zh-cn": "关闭" },
    "target": { "en": "target", "de": "Ziel", "ru": "цель", "pt": "alvo", "nl": "doelwit", "fr": "cibler", "it": "bersaglio", "es": "objetivo", "pl": "cel", "zh-cn": "目标" },
    "current": { "en": "current value", "de": "aktueller Wert", "ru": "текущая стоимость", "pt": "valor atual", "nl": "huidige waarde", "fr": "valeur actuelle", "it": "valore corrente", "es": "valor actual", "pl": "Bieżąca wartość", "zh-cn": "当前值" },
    "actuator": { "en": "actuator", "de": "Aktor", "ru": "привод", "pt": "atuador do", "nl": "aandrijving", "fr": "actionneur", "it": "attuatore", "es": "solenoide", "pl": "Uruchamiacz", "zh-cn": "执行器" },
    "window": { "en": "window", "de": "Fenster", "ru": "окно", "pt": "janela", "nl": "venster", "fr": "la fenêtre", "it": "finestra", "es": "ventana", "pl": "okno", "zh-cn": "窗户" },
    "on": { "en": "on", "de": "ein", "ru": "на", "pt": "sobre", "nl": "Aan", "fr": "sur", "it": "su", "es": "en", "pl": "na", "zh-cn": "在" },
    "off": { "en": "off", "de": "aus", "ru": "выключенный", "pt": "desligado", "nl": "uit", "fr": "désactivé", "it": "spento", "es": "apagado", "pl": "poza", "zh-cn": "离开" },

    "WindowState": { "en": "Window State", "de": "Fensterzustand", "ru": "Состояние окна", "pt": "Estado da janela", "nl": "Vensterstatus", "fr": "État de la fenêtre", "it": "Stato finestra", "es": "Estado de la ventana", "pl": "Stan okna", "zh-cn": "窗口状态" },
    "AllWindowsClosed": { "en": "All Window Closed", "de": "Alle Fenster geschlossen", "ru": "Все окна закрыты", "pt": "Todas as janelas fechadas", "nl": "Alle ramen gesloten", "fr": "Toutes les fenêtres sont fermées", "it": "Tutte le finestre chiuse", "es": "Todas las ventanas cerradas", "pl": "Wszystkie okna zamknięte", "zh-cn": "所有窗口关闭" },
    "WindowOpen": { "en": "Window Open", "de": "Fenster offen", "ru": "Окно открыто", "pt": "Janela aberta", "nl": "Venster open", "fr": "Fenêtre ouverte", "it": "Finestra aperta", "es": "Ventana abierta", "pl": "Okno otwarte", "zh-cn": "开窗" },

    //cardHzngGlobals
    "HeatingPeriodActive": { "en": "Heating Period Active", "de": "Heizperiode aktiv", "ru": "Период нагрева активен", "pt": "Período de aquecimento ativo", "nl": "Verwarmingsperiode actief", "fr": "Période de chauffage active", "it": "Periodo di riscaldamento attivo", "es": "Período de calentamiento activo", "pl": "Aktywny okres ogrzewania", "zh-cn": "加热时间有效" },
    "PublicHolidayToday": { "en": "Public Holiday  Today", "de": "Feiertag heute", "ru": "Государственный праздник сегодня", "pt": "Feriado Público Hoje", "nl": "Feestdag vandaag", "fr": "Jour férié aujourd'hui", "it": "Festa pubblica oggi", "es": "Día festivo hoy", "pl": "Dzisiaj święto państwowe", "zh-cn": "今天的公众假期" },
    "Present": { "en": "Present", "de": "Anwesend", "ru": "Подарок", "pt": "Presente", "nl": "Cadeau", "fr": "Cadeau", "it": "Presente", "es": "Regalo", "pl": "Teraźniejszość", "zh-cn": "当下" },
    "PartyNow": { "en": "Party now", "de": "Party jetzt", "ru": "сейчас вечеринка", "pt": "agora festa", "nl": "nu feest", "fr": "maintenant Party", "it": "ora partito", "es": "ahora fiesta", "pl": "teraz Party", "zh-cn": "现在聚会" },
    "Guests": { "en": "Guests", "de": "Gäste", "ru": "Гостей", "pt": "Convidados", "nl": "Gasten", "fr": "Invités", "it": "Ospiti", "es": "Huéspedes", "pl": "Goście", "zh-cn": "来宾" },
    "HolidayAtHome": { "en": "Holiday At Home", "de": "Urlaub zu Hause", "ru": "Праздник дома", "pt": "Férias em casa", "nl": "Vakantie thuis", "fr": "Vacances à la maison", "it": "Vacanze a casa", "es": "Vacaciones en casa", "pl": "Wakacje w domu", "zh-cn": "在家度假" },
    "HolidayVacation": { "en": "Vacation away", "de": "Urlaub abwesend", "ru": "Отпуск далеко", "pt": "Férias longe", "nl": "Vakantie weg", "fr": "Vacances loin", "it": "Vacanze lontane", "es": "Vacaciones lejos", "pl": "Wakacje daleko", "zh-cn": "度假了" },

    //cardHzngMoFrSaSo
    "Period": { "en": "Period", "de": "Zeitraum", "ru": "Период", "pt": "Período", "nl": "Periode", "fr": "Point final", "it": "Periodo", "es": "Período", "pl": "Kropka", "zh-cn": "时期" },
    "MoFr": { "en": "Mo. to Fr.", "de": "Mo. bis Fr.", "ru": "Пн-Пт.", "pt": "Mo. a Fr.", "nl": "Ma. Tot vr.", "fr": "Lu au Fr.", "it": "Lu. A P.", "es": "Mo. al P.", "pl": "Pon. Do ks.", "zh-cn": "Mo.到Fr." },
    "From": { "en": "from", "de": "von", "ru": "из", "pt": "a partir de", "nl": "van", "fr": "de", "it": "a partire dal", "es": "desde", "pl": "od", "zh-cn": "从" },
    "SaSu": { "en": "Sa. to Su.", "de": "Sa. bis Su.", "ru": "Sa. к вс.", "pt": "Sa. para Su.", "nl": "Za. naar zo.", "fr": "Sa. à Su.", "it": "Sa. a Su.", "es": "Sa. a su.", "pl": "Sa. do Su.", "zh-cn": "萨来苏。" },

    //cardHzngMoSu
    "MoSu": { "en": "Mo. to So.", "de": "Mo. bis So.", "ru": "Пн до Со.", "pt": "Mo. to So.", "nl": "Ma. Tot zo.", "fr": "Mo. à So.", "it": "Mo. a So.", "es": "Mo. a So.", "pl": "Mo. to So.", "zh-cn": "莫。" },

    //cardHzngMoSuSeparat
    "Monday": { "en": "Monday", "de": "Montag", "ru": "понедельник", "pt": "Segunda-feira", "nl": "maandag", "fr": "Lundi", "it": "Lunedi", "es": "lunes", "pl": "poniedziałek", "zh-cn": "周一" },
    "Tuesday": { "en": "Tuesday", "de": "Dienstag", "ru": "вторник", "pt": "terça-feira", "nl": "dinsdag", "fr": "mardi", "it": "martedì", "es": "martes", "pl": "wtorek", "zh-cn": "周二" },
    "Wednesday": { "en": "Wednesday", "de": "Mittwoch", "ru": "среда", "pt": "quarta-feira", "nl": "woensdag", "fr": "Mercredi", "it": "mercoledì", "es": "miércoles", "pl": "środa", "zh-cn": "周三" },
    "Thursday": { "en": "Thursday", "de": "Donnerstag", "ru": "Четверг", "pt": "quinta-feira", "nl": "donderdag", "fr": "jeudi", "it": "giovedi", "es": "jueves", "pl": "czwartek", "zh-cn": "周四" },
    "Friday": { "en": "Friday", "de": "Freitag", "ru": "Пятница", "pt": "sexta-feira", "nl": "vrijdag", "fr": "vendredi", "it": "Venerdì", "es": "viernes", "pl": "piątek", "zh-cn": "星期五" },
    "Saturday": { "en": "Saturday", "de": "Samstag", "ru": "Суббота", "pt": "sábado", "nl": "zaterdag", "fr": "samedi", "it": "Sabato", "es": "sábado", "pl": "sobota", "zh-cn": "周六" },
    "Sunday": { "en": "Sunday", "de": "Sonntag", "ru": "воскресенье", "pt": "domingo", "nl": "zondag", "fr": "dimanche", "it": "Domenica", "es": "domingo", "pl": "niedziela", "zh-cn": "星期日" },

    //cardHzngProfilParam
    "GuestIncrease": { "en": "Guest: Increase", "de": "Gast: Anhebung", "ru": "Гость: Увеличить", "pt": "Convidado: Aumento", "nl": "Gast: verhogen", "fr": "Invité: Augmentation", "it": "Ospite: aumento", "es": "Invitado: Incrementar", "pl": "Gość: Zwiększ", "zh-cn": "客人：增加" },
    "GuestTemperature": { "en": "Guest temperature", "de": "Gasttemperatur", "ru": "Температура гостя", "pt": "Temperatura do convidado", "nl": "Gast temperatuur", "fr": "Température du client", "it": "Temperatura dell'ospite", "es": "Temperatura del huésped", "pl": "Temperatura gości", "zh-cn": "客体温度" },
    "PartyDecrease": { "en": "Party: Decrease", "de": "Party: Absenkung", "ru": "Партия: Уменьшение", "pt": "Parte: Diminuir", "nl": "Feest: afnemen", "fr": "Parti: Diminuer", "it": "Party: diminuzione", "es": "Partido: Disminuir", "pl": "Impreza: Zmniejsz", "zh-cn": "派对：减少" },
    "PartyTemperature": { "en": "Party temperature", "de": "Partytemperatur", "ru": "Температура вечеринки", "pt": "Temperatura de festa", "nl": "Party temperatuur", "fr": "Température de fête", "it": "Temperatura del partito", "es": "Temperatura de la fiesta", "pl": "Temperatura imprezy", "zh-cn": "派对温度" },
    "AbsentDecrease": { "en": "Absent: Decrease", "de": "Abwesend: Absenkung", "ru": "Отсутствует: уменьшение", "pt": "Ausente: Diminuir", "nl": "Afwezig: verlagen", "fr": "Absent: Diminuer", "it": "Assente: diminuzione", "es": "Ausente: Disminuir", "pl": "Brak: spadek", "zh-cn": "缺席：减少" },
    "AbsentTemperature": { "en": "absent temperature", "de": "abwesend Temperatur", "ru": "отсутствие температуры", "pt": "temperatura ausente", "nl": "afwezige temperatuur", "fr": "température absente", "it": "temperatura assente", "es": "temperatura ausente", "pl": "brak temperatury", "zh-cn": "温度不存在" },
    "VacationAbsentDecrease": { "en": "Vacation away: Decrease", "de": "Urlaub abwesend: Absenkung", "ru": "Отпуск вдали: уменьшение", "pt": "Férias fora: diminuir", "nl": "Vakantie weg: verlagen", "fr": "Vacances loin: Diminuer", "it": "Vacanza lontano: diminuzione", "es": "Vacaciones fuera: Disminuir", "pl": "Urlop poza domem: spadek", "zh-cn": "度假：减少" },
    "VacationAbsentTemperature": { "en": "vacation away temperature", "de": "Urlaub abwesend Temperatur", "ru": "отпуск вдали от температуры", "pt": "temperatura de férias longe", "nl": "vakantie weg temperatuur", "fr": "température de vacances", "it": "temperatura in vacanza", "es": "temperatura de vacaciones", "pl": "temperatura poza domem", "zh-cn": "休假温度" },
    "WindowOpenDecrease": { "en": "Window Open: Decrease", "de": "Fenster offen: Absenkung", "ru": "Окно открыто: Уменьшить", "pt": "Janela aberta: diminuir", "nl": "Venster open: verkleinen", "fr": "Fenêtre ouverte: Diminuer", "it": "Finestra aperta: diminuisci", "es": "Ventana abierta: Disminuir", "pl": "Otwarte okno: Zmniejsz", "zh-cn": "开窗：减少" },
    "WindowOpenTemperature": { "en": "window open temperature", "de": "Fensteroffen Temperatur", "ru": "температура открытого окна", "pt": "temperatura de janela aberta", "nl": "raam open temperatuur", "fr": "température d'ouverture de la fenêtre", "it": "temperatura finestra aperta", "es": "temperatura de ventana abierta", "pl": "temperatura otwartego okna", "zh-cn": "开窗温度" },
    "OverrideFor": { "en": "override for", "de": "override für", "ru": "переопределить для", "pt": "substituir por", "nl": "overschrijven voor", "fr": "remplacer pour", "it": "override per", "es": "anular para", "pl": "zastąpić dla", "zh-cn": "覆盖" },
    "OverrideTemp": { "en": "with", "de": "auf", "ru": "с", "pt": "com", "nl": "met", "fr": "avec", "it": "con", "es": "con", "pl": "z", "zh-cn": "和" },
    "MinimalTemperature": { "en": "minimum Temperature", "de": "Mindesttemperatur", "ru": "минимальная температура", "pt": "temperatura mínima", "nl": "minimum temperatuur", "fr": "Température minimale", "it": "Temperatura minima", "es": "temperatura mínima", "pl": "minimalna temperatura", "zh-cn": "最低温度" },


};


module.exports = {
    heatingcontrolDictionary
};