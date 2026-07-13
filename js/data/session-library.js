export const SESSION_LIBRARY = [
  {
    "id": "session-a",
    "type": "fuerza",
    "name": "Piernas + Salto",
    "shortName": "Sesión A",
    "sequencePosition": [
      1
    ],
    "subtitle": "Fuerza de piernas y salto vertical",
    "estimatedDurationMinutes": 40,
    "material": [
      "Mancuernas",
      "Silla o banco",
      "Espacio vertical mínimo de 2,5 m"
    ],
    "colorRole": "sesión A",
    "exerciseIds": [
      "EJ-A01",
      "EJ-A02",
      "EJ-A03",
      "EJ-A04",
      "EJ-A05",
      "EJ-A06",
      "EJ-A07",
      "EJ-A08",
      "EJ-A09"
    ],
    "blocks": [
      {
        "id": "A-0",
        "name": "Activación",
        "position": 0,
        "exerciseIds": [
          "EJ-A01",
          "EJ-A02"
        ]
      },
      {
        "id": "A-1",
        "name": "Salto vertical",
        "position": 1,
        "exerciseIds": [
          "EJ-A03",
          "EJ-A04"
        ]
      },
      {
        "id": "A-2",
        "name": "Fuerza piernas",
        "position": 2,
        "exerciseIds": [
          "EJ-A05",
          "EJ-A06",
          "EJ-A07"
        ]
      },
      {
        "id": "A-3",
        "name": "Tobillo y pantorrilla",
        "position": 3,
        "exerciseIds": [
          "EJ-A08",
          "EJ-A09"
        ]
      }
    ],
    "isMandatoryRest": false,
    "supportsFatigueReduction": true,
    "preSessionNoticeId": null,
    "canBeCompleted": true
  },
  {
    "id": "ankle",
    "type": "recuperación",
    "name": "Tobillo",
    "shortName": "Tobillo",
    "sequencePosition": [
      2,
      4,
      6
    ],
    "subtitle": "Prevención de tobillo y movilidad",
    "estimatedDurationMinutes": 15,
    "material": [
      "Pared cercana",
      "Almohada o toalla enrollada desde semana 3"
    ],
    "colorRole": "tobillo",
    "exerciseIds": [
      "EJ-T01",
      "EJ-T02",
      "EJ-T03",
      "EJ-T04",
      "EJ-T05"
    ],
    "blocks": [
      {
        "id": "T-0",
        "name": "Prevención de tobillo",
        "position": 0,
        "exerciseIds": [
          "EJ-T01",
          "EJ-T02",
          "EJ-T03",
          "EJ-T04",
          "EJ-T05"
        ]
      }
    ],
    "isMandatoryRest": false,
    "supportsFatigueReduction": false,
    "preSessionNoticeId": null,
    "canBeCompleted": true
  },
  {
    "id": "session-b",
    "type": "fuerza",
    "name": "Core + Hombros",
    "shortName": "Sesión B",
    "sequencePosition": [
      3
    ],
    "subtitle": "Core, hombros y brazos",
    "estimatedDurationMinutes": 35,
    "material": [
      "Mancuernas",
      "Silla firme"
    ],
    "colorRole": "sesión B",
    "exerciseIds": [
      "EJ-B01",
      "EJ-B02",
      "EJ-B03",
      "EJ-B04",
      "EJ-B05",
      "EJ-B06",
      "EJ-B07",
      "EJ-B08",
      "EJ-B09",
      "EJ-B10",
      "EJ-B11"
    ],
    "blocks": [
      {
        "id": "B-0",
        "name": "Core — Circuito",
        "position": 0,
        "exerciseIds": [
          "EJ-B01",
          "EJ-B02",
          "EJ-B03",
          "EJ-B04",
          "EJ-B05"
        ]
      },
      {
        "id": "B-1",
        "name": "Hombros",
        "position": 1,
        "exerciseIds": [
          "EJ-B06",
          "EJ-B07",
          "EJ-B08"
        ]
      },
      {
        "id": "B-2",
        "name": "Brazos — Empuje",
        "position": 2,
        "exerciseIds": [
          "EJ-B09",
          "EJ-B10",
          "EJ-B11"
        ]
      }
    ],
    "isMandatoryRest": false,
    "supportsFatigueReduction": true,
    "preSessionNoticeId": null,
    "canBeCompleted": true
  },
  {
    "id": "session-c",
    "type": "fuerza",
    "name": "Dominadas",
    "shortName": "Sesión C",
    "sequencePosition": [
      5
    ],
    "subtitle": "Dominadas, tracción y core",
    "estimatedDurationMinutes": 35,
    "material": [
      "Barra de dominadas",
      "Mancuernas",
      "Silla o banco",
      "Mochila lastrada solo cuando proceda"
    ],
    "colorRole": "sesión C",
    "exerciseIds": [
      "EJ-C01",
      "EJ-C02",
      "EJ-C03",
      "EJ-C04",
      "EJ-C05",
      "EJ-C06",
      "EJ-C07"
    ],
    "blocks": [
      {
        "id": "C-0",
        "name": "Dominadas — Polideportivo",
        "position": 0,
        "exerciseIds": [
          "EJ-C01",
          "EJ-C02"
        ]
      },
      {
        "id": "C-1",
        "name": "Remo + Espalda — Casa",
        "position": 1,
        "exerciseIds": [
          "EJ-C03",
          "EJ-C04"
        ]
      },
      {
        "id": "C-2",
        "name": "Core estabilidad — Casa",
        "position": 2,
        "exerciseIds": [
          "EJ-C05",
          "EJ-C06",
          "EJ-C07"
        ]
      }
    ],
    "isMandatoryRest": false,
    "supportsFatigueReduction": true,
    "preSessionNoticeId": "sessionCNotice",
    "canBeCompleted": true
  },
  {
    "id": "rest",
    "type": "descanso",
    "name": "Descanso",
    "shortName": "Descanso",
    "sequencePosition": [
      7
    ],
    "subtitle": "Descanso completo. Sin físico.",
    "estimatedDurationMinutes": 0,
    "material": [],
    "colorRole": "descanso",
    "exerciseIds": [],
    "blocks": [],
    "isMandatoryRest": true,
    "supportsFatigueReduction": false,
    "preSessionNoticeId": null,
    "canBeCompleted": true
  }
];
