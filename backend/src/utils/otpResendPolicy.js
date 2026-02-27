// calculate resend delay based on count
const getResendDelayMinutes = (count) => {
    if (count === 1 || count === 2) return 2;
    if (count === 3 || count === 4) return 5;
    if (count >= 5) return 1440; // 24 hours
};

module.exports = { getResendDelayMinutes };
