$(function(){ //DOM Ready

    $(".view-list-sort").click(function(){
        $("#view_list_get_sort").val(-$("#view_list_get_sort").val());
        $("#view_list_get_form").submit();
    })
    
});