from django.core.management.base import BaseCommand
from django.urls import URLPattern, URLResolver, get_resolver
from django.conf import settings
import inspect


def iter_patterns(patterns, prefix=""):
    for entry in patterns:
        if isinstance(entry, URLPattern):
            yield prefix + str(entry.pattern), entry.callback
        elif isinstance(entry, URLResolver):
            yield from iter_patterns(entry.url_patterns, prefix + str(entry.pattern))


def get_view_class(callback):
    # Django CBV: callback.view_class
    view_class = getattr(callback, "view_class", None)
    if view_class:
        return view_class
    # DRF Routers attach .cls to callback
    view_class = getattr(callback, "cls", None)
    if view_class:
        return view_class
    # function-based view - try to locate original function
    if inspect.isfunction(callback):
        return callback
    return None


def safe_getattr(obj, name):
    try:
        return getattr(obj, name)
    except Exception:
        return None


class Command(BaseCommand):
    help = "Audit API endpoints: list URL, view, allowed methods, and serializer class (if any)."

    def handle(self, *args, **options):
        resolver = get_resolver(getattr(settings, "ROOT_URLCONF", None))
        patterns = list(iter_patterns(resolver.url_patterns))

        self.stdout.write(f"Found {len(patterns)} URL patterns.\n")

        for path, callback in patterns:
            try:
                view_cls = get_view_class(callback)

                if inspect.isclass(view_cls):
                    module = view_cls.__module__
                    cls_name = view_cls.__name__
                    serializer = safe_getattr(view_cls, "serializer_class")
                    # If serializer is callable (method) or property, note it
                    if serializer is None:
                        # try to detect get_serializer_class override
                        has_get_serializer = hasattr(view_cls, "get_serializer_class")
                        serializer_repr = "<dynamic>" if has_get_serializer else "-"
                    else:
                        try:
                            serializer_repr = f"{serializer.__module__}.{serializer.__name__}"
                        except Exception:
                            serializer_repr = str(serializer)

                    methods = safe_getattr(view_cls, "http_method_names") or None
                    if methods:
                        methods = [m.upper() for m in methods if m not in ("options", "head")]
                        methods_repr = ",".join(methods)
                    else:
                        methods_repr = "-"

                    self.stdout.write(f"{methods_repr:12} {path:50} -> {module}.{cls_name}  serializer={serializer_repr}")

                elif inspect.isfunction(view_cls):
                    module = view_cls.__module__
                    func_name = view_cls.__name__
                    self.stdout.write(f"{'FUNCTION':12} {path:50} -> {module}.{func_name}")
                else:
                    # fallback to callback repr
                    cb_repr = repr(callback)
                    self.stdout.write(f"{path:50} -> {cb_repr}")
            except Exception as e:
                self.stderr.write(f"Error inspecting {path}: {e}")
