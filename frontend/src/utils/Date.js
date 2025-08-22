export const getcurrDate = () => {
        const currDate = new Date();
        const time = currDate.getTime()+currDate.getTimezoneOffset()*60*1000
        const ISTtime = new Date(time + 5.5 * 3600 * 1000);
    // const hours = ISTtime.getHours();
    return ISTtime;
}