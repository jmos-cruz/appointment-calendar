let calendar = $('#calendar')

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
            day.attr('value', `${i - first_day.getDay() + 1}`)
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
                day.append(appointment);
            });

            //Creates an event window everytime a day container is pressed
            day.on('click', () => addEventWindow(day, daySchedule));
        }


        calendar_days.append(day)
    }
}

//Creates a window to add events
let addEventWindow = (day, appointments) => {

    let addEvent = $("#add-event");

    //Background to cancel event addition upon clicking outside of the event window
    let eventWindowBackground;

    if(Object.values($("#event-window-background")).length === 0) {

        eventWindowBackground = $("<div>");

        eventWindowBackground.attr("id", "event-window-background");

        //Eliminates the event window from the HTML file with the background is pressed
        eventWindowBackground.on('click', () => {
            addEvent.html('');
        });

        createEventWindow(eventWindowBackground, day, appointments);

        addEvent.append(eventWindowBackground);
    }
}

let currDate = new Date()

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

/*
 * Creates a window to add events

 * To do: X to close window
 */
let createEventWindow = (background, day, appointments) => {

    let eventWindow = $('<div>');
    eventWindow.attr('id', 'event-window');
    eventWindow.on('click', (event) => event.stopPropagation());
    /*
    * this line triggers helmet CSP, which 
    * doesn't allow scripts in the middle of HTML files
    */
    //eventWindow.attr('onclick', "event.stopPropagation()"); 

    eventWindow.html(
    `<div class='input'>
        <h3 id='date-title'>${day.attr('value')} de ${month_names[curr_month.value]}</h3>
        <input id='date' type='hidden' value='${curr_year.value}-${curr_month.value+1}-${day.attr('value')}'>
    </div>

    <div class="input">
        <label for='start-time'>Início</label>
        <input id='start-time' type='time'>
    </div>

    <div class="input">
        <label for='end-time'>Fim</label>
        <input id='end-time' type='time'>
    </div>

    <div class="input">
        <label for='employee'>Colaborador</label>
        <input id='employee' type='text'>
    </div>

    <div class="input">
        <label for='client'>Cliente</label>
        <input id='client' type='text'>
    </div>
    `);

    background.append(eventWindow);

    let submit = $('<div>');
    submit.addClass("input");

    let button = $('<input>');
    button.addClass('btn');
    button.addClass('btn-success');
    button.attr('id', 'btn');
    button.attr('value', 'Submit');

    //Validations occur upon clicking the submit button
    button.on('click', () => {
        if (!validateAppointment(appointments)) {
            return;
        }

        $.ajax({
            url: '/',
            type:'POST',
            data : JSON.stringify({
                'date' : $('#date').val(),
                'startTime' : $('#start-time').val(),
                'endTime' : $('#end-time').val(),
                'employee' : $('#employee').val(),
                'client' : $('#client').val() ? $('#client').val() : null
            }),
            contentType: 'application/json',
            success : (data, status)=>{
                alert(status);
                document.location.reload();
            }
        })    
    })

    submit.append(button);
    eventWindow.append(submit);
}

let validateAppointment = (appointments) => {

    //Construct date from #start-time to compare with date from #end-time
    //Also to compare with other appointments occuring in the same day
    let startTime = new Date(`${$('#date').val()}T${$('#start-time').val()}:00`);

    if(!validateEssencials() || !validateTimeSequence(startTime) || !counterCheckAppointments(startTime, appointments)) {
        return false;
    }

    return true;
}

//Check if there is a start time and an employee.
//Permits primary key validation in database
let validateEssencials = () => {

    if(!$('#start-time').val() || !$('#employee').val()) {
        if (!$('#start-time').val()) {
            console.log('Não foi escolhida uma hora');
        } else {
            console.log('Não foi escolhido um colaborador');
        }
        return false;
    }
    return true;
}

//Check if start time occurs before end time
let validateTimeSequence = (startTime) => {

    //Check if end time exists. If not, default to 1 hour after start time
    if(!$('#end-time').val()) {
        let stringHour = `${startTime.getHours()+1}`[1] ? `${startTime.getHours()+1}` : `0${startTime.getHours()+1}`;
        let stringMinutes = `${startTime.getMinutes()}`[1] ? `${startTime.getMinutes()}` : `0${startTime.getMinutes()}`;
        $('#end-time').val(`${stringHour}:${stringMinutes}`);
    }

    //Construct date from #end-time to compare with date from #start-time
    let endTime = new Date(`${$('#date').val()}T${$('#end-time').val()}:00`);

    //Meeting cannot start after the end time
    //Compares startTime and endTime by milisecond count
    if (startTime.getTime() >= endTime.getTime()) {
        console.log('Reunião não pode acabar antes de começar');
        return false;
    }

    return true;
}

let counterCheckAppointments = (startTime, appointments) => {

    //Obtain arrays with start times and end times for the day being scheduled
    let startTimesOfAppointments = Object.values(appointments.map(time => time.startTime = new Date(`${time.date}T${time.startTime}`)));
    let endTimesOfAppointments = Object.values(appointments.map(time => time.endTime = new Date(`${time.date}T${time.endTime}`)));
    
    //Check if there are any appointments that overlap with the one being scheduled
    let overlaps = startTimesOfAppointments.filter((time, index) => {
        return startTime.getTime() >= time.getTime() && startTime.getTime() < endTimesOfAppointments[index].getTime();
    })

    if(overlaps[0]) {
        console.log('Já existe marcação para a hora selecionada');
        return false;
    }

    return true;
}