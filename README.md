# TO-DO REST EXAMPLE

## Problem Domain
The following should be possible:
 * Get a list of to-do items
 * Make a to-do item 'complete'
 * Add new to-do items
 * Filter the list of to-do items (based on the text)

A single to-do item has the following properties:
 * id (internal unique id)
 * text (visible text of the item)

## Getting Things Done w/ the To-Do Example
Client applications can use this Service to do the following:
 * Get a list of to-do items (rel:'list')
 * Mark an existing to-do item complete (rel:'complete')
 * Add a new to-do item (rel:'add')
 * Filter the list of to-do items (rel:'search')

## TO-DO Data Elements
The TO-DO media type represents a single to-do item as follows:
  * `{id:n, text:'...'}`

## TO-DO Affordances (processing model)
The TO-DO media type uses link elements to handle the actions
  * `{link: {rel:'list', href:'...'}}`
    * Uses HTTP.GET on the URI in href.

  * `{link: {rel:'add', href:'...'}}`
    * Adds a new item to the list
    * Use HTTP.POST on the URI in href with the following:
      * Content-type: `appliction/x-www-form-urlencoded`
      * Body: `text={@text}`

  * `{link: {rel:'search', href:'...?text={@text}'}}`
    * Finds items that match the search criteria ("contains")
    * Use HTTP.GET on the URI in href with the following:
      * Include the search text in `{@text}` of the URI

  * `{link: {rel:'complete', href:'...'}}`
    * Removes the item from the list
    * Use HTTP.POST on the URI in the href with the following
      * Content-type: `application/x-www-form-urlencode`
      * Body: `id={@id}`

## To-DO Media Type

A complete document has two arrays (links, collections) and looks like this:

```
{
  links:[
    {rel:'list',href'...'},
    {rel:'add',href'...'}
    {rel:'search',href'...?text={@text}'}
  ],
  collection : [
    {
      {link: {rel:'complete',href:'...'},
      id:n,
      text:'...'
    },
    {
      {link: {rel:'complete',href:'...'},
      id:n,
      text:'...'
    }
  ]
}
```

The response is *always* the complete list of `links` and `collection` (e.g. all the items).
 * The `links` array contains the list of actions that are appropriate for this response.
 * The `collection` array contains the list of to-do items.

