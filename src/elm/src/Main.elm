port module Main exposing (..)

-- Show the current time in your time zone.
--
-- Read how it works:
--   https://guide.elm-lang.org/effects/time.html
--
-- For an analog clock, check out this SVG example:
--   https://elm-lang.org/examples/clock
--

import Browser
import Html exposing (..)
import Html.Attributes exposing (class)
import Json.Decode as Decode
import Html.Attributes exposing (property)
import Json.Encode as Encode
import Html.Attributes exposing (attribute)
import Html.Attributes exposing (id)
import Browser.Events exposing (onKeyDown)
import Platform.Sub exposing (batch)
import Maybe exposing (andThen)


-- MAIN


main : Program () Model Msg
main =
  Browser.element
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }



-- MODEL

type alias Tab =
  { value : String
  , showValue : String
  }

type alias Model =
  {
    tabs : List Tab,
    selectedFile : Maybe Int
  }

decoderTab : Decode.Decoder Tab
decoderTab =
  Decode.map2 Tab
    (Decode.field "value" Decode.string)
    (Decode.field "showValue" Decode.string)

init : () -> (Model, Cmd Msg)
init _ =
  ( Model [] Nothing
  , Cmd.none
  )



-- UPDATE
type Direction
  = Up
  | Down
  | Enter
  | Other

keyDecoder : Decode.Decoder Msg
keyDecoder =
  Decode.map (ChangeSelection << toDirection) (Decode.field "key" Decode.string)

toDirection : String -> Direction
toDirection string =
  case string of
    "ArrowUp" ->
      Up

    "ArrowDown" ->
      Down

    "Enter" ->
      Enter

    _ ->
      Other

type Msg
  = Init (List Tab)
  | NoOp String
  | ChangeSelection Direction

at : Int -> List a -> Maybe a
at index list =
  List.drop index list
    |> List.head

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Init tabsWithPreview -> ({model | tabs = tabsWithPreview, selectedFile = if List.isEmpty tabsWithPreview then Nothing else Just 0}, Cmd.none)
    NoOp string -> ({model | tabs = [Tab string string]}, Cmd.none)
    ChangeSelection direction ->
      case direction of
        Up ->
          let
            newIndex = Maybe.map (\i -> if i == List.length model.tabs - 1 then i else i + 1) model.selectedFile
            newSelection = newIndex
              |> andThen (\i -> at i model.tabs)
          in
          ( { model | selectedFile = newIndex }
          , case newSelection of
              Just t -> sendMessage <| Encode.object [("action", Encode.string "display"), ("value", Encode.string t.value)]
              Nothing -> Cmd.none
          )
        Down ->
          let
            newIndex = Maybe.map (\i -> if i == 0 then 0 else i - 1) model.selectedFile
            newSelection = newIndex
              |> andThen (\i -> at i model.tabs)
          in
          ( { model | selectedFile = newIndex }
          , case newSelection of
              Just t -> sendMessage <| Encode.object [("action", Encode.string "display"), ("value", Encode.string t.value)]
              Nothing -> Cmd.none
          )
        Enter ->
          let
            selection = model.selectedFile
              |> andThen (\i -> at i model.tabs)
          in
          ( model
          , case selection of
              Just t -> sendMessage <| Encode.object [("action", Encode.string "open"), ("value", Encode.string t.value)]
              Nothing -> Cmd.none
          )
        Other ->
          (model, Cmd.none)


-- PORTS

port sendMessage : Encode.Value -> Cmd msg
port messageReceiver : (Decode.Value -> msg) -> Sub msg


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  batch
    [ messageReceiver (\value ->
        case Decode.decodeValue (Decode.list decoderTab) value of
          Ok tabsWithPreview -> Init tabsWithPreview
          Err err -> NoOp <| Decode.errorToString err
        ),
      onKeyDown keyDecoder
    ]



-- VIEW


view : Model -> Html Msg
view model =
  div [class "split"] [
    div [class "files"] <|
      List.indexedMap (\i t -> div [class <| if Just i == model.selectedFile then "selected" else "file"] [text t.showValue]) model.tabs
    ,
    div [class "preview"] [
      pre [] [
        code [id "code"] []
      ]
    ]
  ]