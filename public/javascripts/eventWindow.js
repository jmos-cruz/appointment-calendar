
//Adds a window for appointment creation to the calendar

let addEventWindow = (day, appointments, appointment) => {
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

        createEventWindow(eventWindowBackground, day, appointments, appointment);

        addEvent.append(eventWindowBackground);
    }
}


/*
 * Creates a window to add events

 * To do: X to close window
 */
let createEventWindow = (background, day, appointments, appointment) => {
    
    const month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    let date = {};
    ({0:date.year, 1:date.month, 2:date.day} = day.val().split('-'));

    let eventWindow = $('<div>');
    eventWindow.attr('id', 'event-window');
    eventWindow.on('click', (event) => event.stopPropagation());
    /*
    * this line triggers helmet CSP, which 
    * doesn't allow scripts in the middle of HTML files
    */
    //eventWindow.attr('onclick', "event.stopPropagation()"); 

    eventWindow.html(
    `
    <div class='input'>
        <h3 id='date-title'>${date.day} de ${month_names[date.month]}</h3>
        <input id='date' type='hidden' value='${date.year}-${parseInt(date.month)+1}-${date.day}'>
    </div>

    <div class="input">
        <label for='start-time'>Início</label>
        <input id='start-time' type='time' value='${appointment ? appointment.startTime.substring(0, 5) : ''}'>
    </div>

    <div class="input">
        <label for='end-time'>Fim</label>
        <input id='end-time' type='time' value='${appointment ? appointment.endTime.substring(0, 5) : ''}'>
    </div>

    <div class="input">
        <label for='employee'>Colaborador</label>
        <input id='employee' type='text' value='${appointment ? appointment.employee : ''}'>
    </div>

    <div class="input">
        <label for='client'>Cliente</label>
        <input id='client' type='text' value='${appointment ? appointment.client : ''}'>
    </div>
    `);

    background.append(eventWindow);

    let windowHeader = $('<div>');
    windowHeader.addClass('input');
    windowHeader.attr('id', 'window-header');

    let closeWindow = $('<div>');
    closeWindow.attr('id', 'close-window');
    closeWindow.html('<pre> X </pre>');
    closeWindow.on('click', () => {
        $('#add-event').html('');
    })
    windowHeader.append(closeWindow);
    eventWindow.prepend(windowHeader);

    let submit = $('<div>');
    submit.addClass("input");

    let submitButton = $('<input>');
    submitButton.addClass('btn');
    submitButton.addClass('btn-success');
    submitButton.attr('id', 'sub-btn');
    submitButton.attr('value', 'Submeter');

    //Validations occur upon clicking the submit button
    //For a PUT request, best would be to send an array with the original start time
    //and the regular object that is already sent.
    //Also have to add a way to change the date in the event window
    submitButton.on('click', () => {
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

    submit.append(submitButton);

    let deleteButton = $('<input>');
    deleteButton.addClass('btn');
    deleteButton.addClass('btn-danger');
    deleteButton.attr('id', 'dlt-btn');
    deleteButton.attr('value', 'Remover');

    deleteButton.on('click', () => {
        if(!$('#start-time').val()) {
            console.log('Não foi escolhida uma marcação para apagar.'); 
            return;
        
        }
        $.ajax({
            url: '/',
            type:'DELETE',
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

    submit.append(deleteButton);

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

export default addEventWindow;