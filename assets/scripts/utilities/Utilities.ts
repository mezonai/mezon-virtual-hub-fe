const BIGNUMBER_CONVERT_SHORT = [
    {
        decimals: 4,
        divideDecimals: 0,
        text: "",
    },
    {
        decimals: 6,
        divideDecimals: 3,
        text: "K",
    },
    {
        decimals: 9,
        divideDecimals: 6,
        text: "M",
    },
    {
        decimals: 12,
        divideDecimals: 9,
        text: "B",
    },
    {
        decimals: 15,
        divideDecimals: 12,
        text: "aa",
    },
    {
        decimals: 18,
        divideDecimals: 15,
        text: "ab",
    },
    {
        decimals: 21,
        divideDecimals: 18,
        text: "ac",
    },
    {
        decimals: 26,
        divideDecimals: 21,
        text: "ad",
    },
    {
        decimals: 29,
        divideDecimals: 24,
        text: "ae",
    },
    {
        decimals: 32,
        divideDecimals: 27,
        text: "af",
    },
    {
        decimals: 35,
        divideDecimals: 30,
        text: "ag",
    },
    {
        decimals: 38,
        divideDecimals: 33,
        text: "ah",
    },
    {
        decimals: 41,
        divideDecimals: 36,
        text: "ai",
    },
    {
        decimals: 44,
        divideDecimals: 39,
        text: "aj",
    },
    {
        decimals: 47,
        divideDecimals: 42,
        text: "ak",
    },
    {
        decimals: 50,
        divideDecimals: 45,
        text: "al",
    },
    {
        decimals: 53,
        divideDecimals: 48,
        text: "am",
    },
    {
        decimals: 56,
        divideDecimals: 51,
        text: "an",
    },
    {
        decimals: 59,
        divideDecimals: 54,
        text: "ao",
    },
    {
        decimals: 62,
        divideDecimals: 57,
        text: "ap",
    },
    {
        decimals: 65,
        divideDecimals: 60,
        text: "aq",
    },
    {
        decimals: 68,
        divideDecimals: 63,
        text: "ar",
    },
    {
        decimals: 71,
        divideDecimals: 66,
        text: "as",
    },
    {
        decimals: 74,
        divideDecimals: 69,
        text: "at",
    },
    {
        decimals: 77,
        divideDecimals: 72,
        text: "au",
    },
    {
        decimals: 80,
        divideDecimals: 75,
        text: "av",
    },
    {
        decimals: 83,
        divideDecimals: 78,
        text: "aw",
    },
    {
        decimals: 86,
        divideDecimals: 81,
        text: "ax",
    },
    {
        decimals: 89,
        divideDecimals: 84,
        text: "ay",
    },
    {
        decimals: 92,
        divideDecimals: 87,
        text: "az",
    },
];

const BIGNUMBER_CONVERT_LONG = [
    {
        decimals: 9,
        divideDecimals: 0,
        text: "",
    },
    {
        decimals: 12,
        divideDecimals: 3,
        text: "K",
    },
    {
        decimals: 15,
        divideDecimals: 6,
        text: "M",
    },
    {
        decimals: 18,
        divideDecimals: 9,
        text: "B",
    },
    {
        decimals: 21,
        divideDecimals: 12,
        text: "aa",
    },
    {
        decimals: 24,
        divideDecimals: 15,
        text: "ab",
    },
    {
        decimals: 27,
        divideDecimals: 18,
        text: "ac",
    },
    {
        decimals: 30,
        divideDecimals: 21,
        text: "ad",
    },
    {
        decimals: 33,
        divideDecimals: 24,
        text: "ae",
    },
    {
        decimals: 36,
        divideDecimals: 27,
        text: "af",
    },
    {
        decimals: 39,
        divideDecimals: 30,
        text: "ag",
    },
    {
        decimals: 42,
        divideDecimals: 33,
        text: "ah",
    },
    {
        decimals: 45,
        divideDecimals: 36,
        text: "ai",
    },
    {
        decimals: 48,
        divideDecimals: 39,
        text: "aj",
    },
    {
        decimals: 51,
        divideDecimals: 42,
        text: "ak",
    },
    {
        decimals: 54,
        divideDecimals: 45,
        text: "al",
    },
    {
        decimals: 57,
        divideDecimals: 48,
        text: "am",
    },
    {
        decimals: 60,
        divideDecimals: 51,
        text: "an",
    },
    {
        decimals: 63,
        divideDecimals: 54,
        text: "ao",
    },
    {
        decimals: 66,
        divideDecimals: 57,
        text: "ap",
    },
    {
        decimals: 69,
        divideDecimals: 60,
        text: "aq",
    },
    {
        decimals: 72,
        divideDecimals: 63,
        text: "ar",
    },
    {
        decimals: 75,
        divideDecimals: 66,
        text: "as",
    },
    {
        decimals: 78,
        divideDecimals: 69,
        text: "at",
    },
    {
        decimals: 81,
        divideDecimals: 72,
        text: "au",
    },
    {
        decimals: 84,
        divideDecimals: 75,
        text: "av",
    },
    {
        decimals: 87,
        divideDecimals: 78,
        text: "aw",
    },
    {
        decimals: 90,
        divideDecimals: 81,
        text: "ax",
    },
    {
        decimals: 93,
        divideDecimals: 84,
        text: "ay",
    },
    {
        decimals: 96,
        divideDecimals: 87,
        text: "az",
    },
]


export default class Utilities {
    static async sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    static convertBigNumberToStr(value, useShortType: boolean = true) {
        if (useShortType) {
            return this.doConvert(value, BIGNUMBER_CONVERT_SHORT)
        }
        else {
            return this.doConvert(value, BIGNUMBER_CONVERT_LONG)
        }

    }

    private static doConvert(value, BIGNUMBER_CONVERT) {
        for (let convertInfo of BIGNUMBER_CONVERT) {
            if (value < Math.pow(10, convertInfo.decimals)) {
                if (convertInfo.text == "") {
                    return value.toLocaleString();
                } else {
                    const divider = Math.pow(10, convertInfo.divideDecimals);
                    let newNumber = value / divider;
                    newNumber = Math.floor(newNumber * 10) / 10;
                    const newNumberStr = newNumber % 1 === 0
                        ? newNumber.toFixed(0)
                        : newNumber.toFixed(1);

                    return newNumberStr + convertInfo.text;
                }
            }
        }

        return value.toLocaleString();
    }

    static secondsToHMS(seconds: number): string {
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const formattedHours = this.addLeadingZeros(hours);
        const formattedMinutes = this.addLeadingZeros(minutes);
        const formattedSeconds = this.addLeadingZeros(secs);

        let result = "";
        if (days > 0) {
            result += ` 0${days} ngày `;
        }
        result += `${formattedHours} giờ : ${formattedMinutes} phút : ${formattedSeconds} giây`;
        return result;
    }

    static pad(n: number): string {
        return n < 10 ? '0' + n : n.toString();
    }

    static secondsToHMSPlant(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${this.pad(hours)}h: ${this.pad(minutes)}m: ${this.pad(secs)}s`;
    }

    static addLeadingZeros(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    static getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    static formatDateVN(isoString: string): string {
        return new Date(isoString).toLocaleDateString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

}
