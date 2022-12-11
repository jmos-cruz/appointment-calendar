let calendar = document.querySelector('#calendar')

const month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
}

getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('#days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    //if statements to protect against non-existing months
    let currDate = new Date()
    if (month > 11 || month < 0) month = currDate.getMonth()
    if (!year) year = currDate.getFullYear()

    //change the month and year values in the HTML file
    let curr_month = `${month_names[month]}`
    document.getElementById('month').textContent=curr_month;
    calendar_header_year.innerHTML = year

    // get first day of month
    let first_day = new Date(year, month, 1)

    console.log(first_day);

    console.log(first_day.getDay());

    console.log(days_of_month[month] + first_day.getDay() - 1);

    //what actually generates the calendar
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div')
        
        if (i >= first_day.getDay()) {
            day.classList.add('day')
            day.setAttribute('value', `${i - first_day.getDay() + 1}`)
            day.innerHTML = i - first_day.getDay() + 1

            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.classList.add('curr-date')
            }
        }

        //Creates an event window everytime a day container is pressed
        day.addEventListener('click', () => addEventWindow(day), false);

        calendar_days.appendChild(day)
    }
}

//Creates a window to add events
let addEventWindow = (day) => {

    let addEvent = document.getElementById("add-event");

    //Background to cancel event addition upon clicking outside of the event window
    let eventWindowBackground;
    if(!document.getElementById("event-window-background")) {

        eventWindowBackground = document.createElement("div");

        eventWindowBackground.setAttribute("id", "event-window-background");

        //Eliminates the event window from the HTML file with the background is pressed
        eventWindowBackground.addEventListener('click', () => {
            addEvent.innerHTML = '';
        }, false);

        createEventWindow(eventWindowBackground, day);

        addEvent.appendChild(eventWindowBackground);
    }
}

let currDate = new Date()

let curr_month = {value: currDate.getMonth()}
let curr_year = {value: currDate.getFullYear()}

generateCalendar(curr_month.value, curr_year.value)


//Adds functionality to the left arrow to decrease the month value
document.querySelector('#prev-month').onclick = () => {
    --curr_month.value    
    if (curr_month.value === -1) {
        curr_month.value = 11;
        --curr_year.value;
    }
    generateCalendar(curr_month.value, curr_year.value)
}

//Adds functionality to the right arrow to increase the month value
document.querySelector('#next-month').onclick = () => {
    ++curr_month.value;
    if (curr_month.value === 12) {
        curr_month.value = 0;
        ++curr_year.value;
    }
    generateCalendar(curr_month.value, curr_year.value)
}

/*
 * Creates a window to add events

 * To do: X to close window
 */
let createEventWindow = (background, day) => {
    let eventWindow = document.createElement('form');
    eventWindow.setAttribute('id', 'event-window');
    eventWindow.setAttribute('onclick', "event.stopPropagation()");

    eventWindow.innerHTML = `
    <input type='hidden' value="${curr_year.value}-${curr_month.value+1}-${day.getAttribute('value')}">

    <label for='start-time'>Início</label>
    <input id='start-time' type='time'>
    
    <label for='end-time'>Fim</label>
    <input id='end-time' type='time'>
    
    <label for='employee'>Colaborador</label>
    <input id='employee' type='text'>

    <label for='client'>Cliente</label>
    <input id='client' type='text'>
    <submit class="btn btn-success" type='button'>Submit</submit>
    `;

    background.appendChild(eventWindow);
}
