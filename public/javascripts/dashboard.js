$(document).ready(function () {
    $('.dataTables').DataTable({
        "columnDefs": [
            { "width": "5%", "targets": 0 }
        ],
        "responsive": true,
        "paging": true,
        "ajax": "./api/projects",
        "columns": [
            {
                "data": null,
                "render": function (data, type, row, meta) {
                    return "<Button class=\"btn-form btn btn-sm btn-default\" type=\"button\" data-toggle=\"modal\" data-id=\"" + data._id + "\" data-name=\"" + data.proj_name + "\" data-url=\"" + data.svn_url + "\" data-freq=\"" + data.freq_id + "\" data-target=\"#updateProjectModal\"> Edit </Button>";
                }
            },
            {
                "data": null,
                "render": function (data, type, row, meta) {
                    return "<a href=\"" + data.url + "\" > " + data.proj_name + " </a>";
                }
            },
            { "data": "updated" },
            { "data": "frequency" },
            { "data": "svn_url" }
        ]
    });
});

$('#updateProjectModal').on('show.bs.modal', function (e) {
    const name = $(e.relatedTarget).data('name');
    const url = $(e.relatedTarget).data('url');
    const frequency = $(e.relatedTarget).data('freq');
    const id = $(e.relatedTarget).data('id');
    const path = "/api/projects/" + id;
    $(e.currentTarget).find('input[name="name"]').val(name);
    $(e.currentTarget).find('input[name="url"]').val(url);
    $(e.currentTarget).find('select[name="freq_id"]').val(frequency);
    $(e.currentTarget).find('input[name="id"]').val(id);
    $(e.currentTarget).find('form[name="updateForm"]')[0].action = path;
});

$("#updateProjectForm").submit(function (e) {
    e.preventDefault();
    const name = $(e.currentTarget).find('input[name="name"]').val();
    const url = $(e.currentTarget).find('input[name="url"]').val();
    const frequency = $(e.currentTarget).find('select[name="freq_id"]').val();
    const path = $(e.currentTarget)[0].action;

    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: path,
        type: 'PATCH',
        data: JSON.stringify([{ propName: "proj_name", value: name },
        { propName: "svn_url", value: url },
        { propName: "freq_id", value: frequency }]),
        success: function (response, textStatus, jqXhr) {
            console.log("Venue Successfully Patched!");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.log("The following error occured: " + textStatus, errorThrown);
        }
    });
    $('#updateProjectModal').modal('hide');
    $('.dataTables').DataTable().ajax.reload();
});

$("#addProjectForm").submit(function (e) {
    e.preventDefault();
    const name = $(e.currentTarget).find('input[name="name"]').val();
    const url = $(e.currentTarget).find('input[name="url"]').val();
    const frequency = $(e.currentTarget).find('select[name="freq_id"]').val();
    const path = $(e.currentTarget)[0].action;

    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: path,
        type: 'POST',
        data: JSON.stringify({
            "name": name,
            "url": url,
            "freq_id": frequency
        }),
        success: function (response, textStatus, jqXhr) {
            console.log("Venue Successfully Patched!");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.log("The following error occured: " + textStatus, errorThrown);
        }
    });
    $('#addProjectModal').modal('hide');
    $('.dataTables').DataTable().ajax.reload();
});

$('#addProjectModal').on('hidden.bs.modal', function (e) {
    $(e.currentTarget).find('form')[0].reset();
});

$(".generateButton").click(function(){
    const path = this.getAttribute("data-request");
    console.log(this);
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: path,
        type: 'POST',
        success: function (response, textStatus, jqXhr) {
            console.log("Venue Successfully Patched!");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.log("The following error occured: " + textStatus, errorThrown);
        }
    });
});

$(".runButton").click(function(){
    const path = this.getAttribute("data-request");
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: path,
        type: 'POST',
        success: function (response, textStatus, jqXhr) {
            console.log("Venue Successfully Patched!");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.log("The following error occured: " + textStatus, errorThrown);
        }
    });
});