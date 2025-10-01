const conditions = [
    {
        "persons": [
            {
                "age": "65",
                "gender": "Woman",
                "esi": "3",
                "complaint": "Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "admit"
                }
            },
            {
                "age": "91",
                "gender": "Woman",
                "esi": "3",
                "complaint": "Full Trauma",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "admit",
                    "eo": "deny"
                }
            },
            {
                "age": "75",
                "gender": "Man",
                "esi": "2",
                "complaint": "Fatigue",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "admit",
                    "eo": "admit"
                }
            },
            {
                "age": "33",
                "gender": "Man",
                "esi": "2",
                "complaint": "Suture Removal",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "56",
                "gender": "Man",
                "esi": "2",
                "complaint": "Testicle Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "41",
                "gender": "Man",
                "esi": "2",
                "complaint": "Arm Injury",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            }
        ]
    },
    {
        "persons": [
            {
                "age": "90",
                "gender": "Woman",
                "esi": "3",
                "complaint": "Sinus Problem",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "31",
                "gender": "Woman",
                "esi": "1",
                "complaint": "Elbow Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "admit",
                    "eo": "admit"
                }
            },
            {
                "age": "104",
                "gender": "Woman",
                "esi": "4",
                "complaint": "Fall",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "admit"
                }
            },
            {
                "age": "23",
                "gender": "Man",
                "esi": "3",
                "complaint": "Elbow Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "admit",
                    "eo": "deny"
                }
            },
            {
                "age": "96",
                "gender": "Man",
                "esi": "4",
                "complaint": "Skin Problem",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "32",
                "gender": "Man",
                "esi": "4",
                "complaint": "Leg Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            }
        ]
    },
    {
        "persons": [
            {
                "age": "47",
                "gender": "Woman",
                "esi": "1",
                "complaint": "Hip Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "admit",
                    "eo": "admit"
                }
            },
            {
                "age": "103",
                "gender": "Woman",
                "esi": "2",
                "complaint": "Back Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "deny",
                    "eo": "admit"
                }
            },
            {
                "age": "42",
                "gender": "Man",
                "esi": "4",
                "complaint": "Sore Throat",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "39",
                "gender": "Man",
                "esi": "1",
                "complaint": "Post-op Problem",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "admit",
                    "dp": "admit",
                    "eo": "deny"
                }
            },
            {
                "age": "84",
                "gender": "Man",
                "esi": "3",
                "complaint": "Ear Pain",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            },
            {
                "age": "67",
                "gender": "Man",
                "esi": "3",
                "complaint": "Allergic Reaction",
                "decisions": {
                    "nomodel": "\u00A0",
                    "control": "deny",
                    "dp": "deny",
                    "eo": "deny"
                }
            }
        ]
    }
]

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}