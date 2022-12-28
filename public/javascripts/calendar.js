import addEventWindow from "./eventWindow.js";

const month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

let isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)
}

let getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

let generateCalendar = async (month, year) => {

    let calendar_days = $('#days')

    let calendar_header_year = $('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.html("");

    //if statements to protect against non-existing months
    let currDate = new Date()
    if (month > 11 || month < 0) month = currDate.getMonth()
    if (!year) year = currDate.getFullYear()

    //change the month and year values in the HTML file
    let curr_month = `${month_names[month]}`
    $('#month').text(curr_month);
    calendar_header_year.html(year);

    // get first weekday of month
    let first_day = new Date(year, month, 1)

    //Get all appointments for the current month
    const response = await fetch(`${window.location.href}api/appointments/${year}/${month+1}`);
    const appointments = await response.json();

    //Remove timestamp from date
    appointments.map(element => {
        element.date = element.date.substring(0, 10);
    });

    //what actually generates the calendar
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = $('<div>');
        
        if (i >= first_day.getDay()) {
            day.addClass('day')
            day.val(`${year}-${month}-${i - first_day.getDay() + 1}`)
            day.html(i - first_day.getDay() + 1);

            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.addClass('curr-date')
            }
            
            let dayInString = `${i - first_day.getDay() + 1}`[1] ? `${year}-${month+1}-${i - first_day.getDay() + 1}` : `${year}-${month+1}-0${i - first_day.getDay() + 1}`
            
            let daySchedule = appointments.filter(appointment => {return appointment.date === dayInString});

            daySchedule.forEach(element => {
                let appointment = $('<div>');
                appointment.addClass('appointment');
                appointment.html(`<p>${element.startTime.substring(0, 5)} - ${element.employee}</p>`);
                appointment.on('click', () =>{
                    addEventWindow(day, daySchedule, element);
                })

                day.append(appointment);
            });

            //Creates an event window everytime a day container is pressed
            //Receives the schedule for the day to confirm that no other meeting is going to take place at the same time
            day.on('click', () => addEventWindow(day, daySchedule));
        }

        calendar_days.append(day)
    }
}

let currDate = new Date();

let curr_month = {value: currDate.getMonth()};
let curr_year = {value: currDate.getFullYear()};

generateCalendar(curr_month.value, curr_year.value);

//Adds functionality to the left arrow to decrease the month value
document.querySelector('#prev-month').onclick = () => {
    --curr_month.value    
    if (curr_month.value === -1) {
        curr_month.value = 11;
        --curr_year.value;
    }
    generateCalendar(curr_month.value, curr_year.value);
}

//Adds functionality to the right arrow to increase the month value
document.querySelector('#next-month').onclick = () => {
    ++curr_month.value;
    if (curr_month.value === 12) {
        curr_month.value = 0;
        ++curr_year.value;
    }
    generateCalendar(curr_month.value, curr_year.value);
}

